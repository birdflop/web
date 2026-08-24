-- Intentional drop, recreated with the new shape in 0016: old ServersPulse
-- links used slug + reverse verification and cannot be upgraded to the
-- claim-code model (they have no listingRef/linkToken). Owners reconnect by
-- generating a link code in their ServersPulse dashboard.
DROP TABLE `serverspulseLinks`;