import { strict as assert } from "node:assert";
import { authenticate } from "../src/auth.js";

assert.equal(authenticate({ headers: { authorization: "Bearer abc" } }, [{ token: "abc" }]).token, "abc");
