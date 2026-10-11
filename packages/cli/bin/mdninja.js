#!/usr/bin/env node
const { createProgram } = require("../src/cli.js");
const program = createProgram();
program.parse(process.argv);
