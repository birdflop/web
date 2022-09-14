const url = require("url");
const ejs = require('ejs');
const path = require("path");
const express = require('express');
const { PORT, CLIENT_ID, CLIENT_SECRET, URL, SESSION_SECRET, APPROVED_WEBHOOK } = require('./config');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const approvedHook = new Webhook(APPROVED_WEBHOOK);
const passport = require("passport");
const bodyParser = require("body-parser");
const session = require("express-session");
const Strategy = require("passport-discord").Strategy;
const analyzeTimings = require('./analyze/functions/analyzeTimings');
const analyzeProfile = require('./analyze/functions/analyzeProfile');
const { existsSync } = require('fs');
const { getPending, addPreset, deletePending, getPresets, addPending } = require('./database/database');
const utils = require('./utils');
const app = express();
const MemoryStore = require("memorystore")(session);
// The absolute path of current this directory.
const dataDir = path.resolve(`${process.cwd()}${path.sep}site`);

// Absolute path of ./templates directory.
const templateDir = path.resolve(`${dataDir}${path.sep}templates`);

// Deserializing and serializing users without any additional logic.
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.engine('ejs', ejs.renderFile);
app.set("view engine", "ejs");
app.set('views', templateDir);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", express.static(path.resolve(`${dataDir}${path.sep}assets`)));
app.use(session({
        secret: SESSION_SECRET,
        store: new MemoryStore({ checkPeriod: 86400000 }),
        resave: false,
        saveUninitialized: false,
    }));
passport.use(
    new Strategy(
        {
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: URL + "/callback",
        scope: ["identify"],
        },
        (accessToken, refreshToken, profile, done) => {
        // On login we pass in profile with no logic.
        process.nextTick(() => done(null, profile));
        },
    ),
);

// We initialize passport middleware.
app.use(passport.initialize());
app.use(passport.session());

const renderTemplate = (res, req, template, data = {}) => {
    // Default base data which passed to the ejs template by default.
    const baseData = {
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
    };
    // We render template using the absolute path of the template and the merged default data with the additional data provided.
    res.render(
        path.resolve(`${templateDir}${path.sep}${template}`),
        Object.assign(baseData, data),
    );
};

// We declare a checkAuth function middleware to check if an user is logged in or not, and if not redirect him.
const checkAuth = (req, res, next) => {
    // If authenticated we forward the request further in the route.
    if (req.isAuthenticated()) return next();
    // If not authenticated, we set the url the user is redirected to into the memory.
    req.session.backURL = req.url;
    // We redirect user to login endpoint/route.
    res.redirect("/login");
};

app.get('/', (req, res) => {
    renderTemplate(res, req, 'index.ejs');
});


app.get("/login", (req, res, next) => {
    // We determine the returning url.
    if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname === app.locals.domain) {
          req.session.backURL = parsed.path;
      }
    }
 else {
      req.session.backURL = "/";
    }
  next();
  }, passport.authenticate("discord"));

app.get("/callback", passport.authenticate("discord", { failureRedirect: "/" }), (req,res) => {
  // log when a user logs in
  console.log(`User logged in: ${req.user.username + "#" + req.user.discriminator}`);
  if (req.session.backURL) {
      const backURL = req.session.backURL;
      req.session.backURL = null;
      res.redirect(backURL);
  }
 else {
      res.redirect("/");
  }
});


app.get("/logout", function(req, res, next) {
  req.session.destroy(() => {
        res.redirect('/');
  });
});

app.get('/admin', checkAuth, (req, res) => {
    if(req.user.id != "798738506859282482") return res.redirect('/');
    getPending().then((pending) => {
        renderTemplate(res, req, 'admin.ejs', {
            presets: pending,
        });
    });
});

app.get('/:page', (req, res) => {
    if (!existsSync(`./site/templates/${req.params.page.toLowerCase()}.ejs`)) return renderTemplate(res, req, 'notfound.ejs');
    if(req.params.page.toLowerCase() == "presets") {
        getPresets().then((presets) => {
            renderTemplate(res, req, 'presets.ejs', {
                presets: presets,
                utils: utils,
            });
        });
        return;
    }
    renderTemplate(res, req, `${req.params.page.toLowerCase()}.ejs`, {
        queryPreset: req.query.preset,
        alert: null,
        alert_type: null
    });
});

app.get('/timings-result/:id', async (req, res) => {
    const fields = await analyzeTimings(req.params.id);
    renderTemplate(res, req, `timings-result.ejs`, {
        fields,
    });
});

app.get('/profile-result/:id', async (req, res) => {
    const fields = await analyzeProfile(req.params.id);
    renderTemplate(res, req, `profile-result.ejs`, {
        fields,
    });
});

app.post("/admin", checkAuth, async (req, res) => {
    if(req.user.id != "798738506859282482") return res.redirect('/');
    if(req.body.approved) {
        await addPreset(req.body.name, req.body.description, req.body.author, req.body.id, req.body.data, req.body.date);
    }
else{
        const embed = new MessageBuilder()
            .setTitle("Preset Rejected")
            .setDescription(`${req.body.author}'s preset **${req.body.name}** has been rejected by the staff team.`)
            .setColor("#ff0000")
            .setTimestamp()
            .setFooter("Preset Rejected");
            approvedHook.send(embed);
    }
    await deletePending(req.body.id);
    await res.redirect('/admin');
});

app.post('/:page', (req, res) => {
    if(req.params.page.toLowerCase() == "gradients" || req.params.page.toLowerCase() == "animtab") {
        if(!req.body.name || !req.body.description || !req.user || !req.body.preset) {
            return renderTemplate(res, req, `${req.params.page.toLowerCase()}.ejs`, {
                alert: "Please fill out all fields.",
                alert_type: "danger",
                queryPreset: req.query.preset,
            });
        }
        addPending(req.body.name, req.body.description, req.user.username, req.user.id, req.body.preset, Date.now());
        return renderTemplate(res, req, `${req.params.page.toLowerCase()}.ejs`, {
            alert: "Your preset has been submitted for approval.",
            alert_type: "success",
            queryPreset: req.query.preset,
        });
    }
    return;
});

app.listen(PORT, null, null, () => {
    console.log('Server started on port ' + PORT);
});