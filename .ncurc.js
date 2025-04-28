module.exports = {
  "reject": [
    "eslint", // new major version which idk how to fix yet with qwik
    "@types/eslint",
    "vite", // building broken on v6
    "@prisma/client" // building broken on v6.6.0
  ],
}