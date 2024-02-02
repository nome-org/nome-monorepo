import { Integration } from "express-zod-api";
import path from "node:path";
import fs from "node:fs";
import { routing } from "../router/router";

fs.writeFileSync(
    path.resolve(__dirname, "../../../gif-creator-ui/src/api/generated.ts"),
    new Integration({
        routing,
        variant: "types",
        optionalPropStyle: { withQuestionMark: true, withUndefined: true },
    }).print({ removeComments: true, newLine: 1, omitTrailingSemicolon: true }),
    "utf-8",
);
