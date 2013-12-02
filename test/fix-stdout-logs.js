/* Copyright (c) 2013 StrongLoop, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/*
 * Mocha does not capture stdout messages printed by the tests it runs.
 * These log messages are printed together with the xunit report to stdout
 * and corrupt the xunit file.
 *
 * This code installs a redirect from stdout to stderr before each test
 * and restores it when the test is done. This way the log messages
 * don't interfere with xunit report.
 *
 * Note that this file cannot be required using mocha's -r option,
 * because beforeEach/afterEach are not defined at that stage.
 * We have to "run" it as a regular test file.
 *
 * See also https://strongloop.atlassian.net/browse/SLQ-169
 */

beforeEach(redirectStdOutToStderr);
afterEach(restoreStdOut);

var origWrite;
function redirectStdOutToStderr() {
  origWrite = process.stdout.write;
  process.stdout.write = process.stderr.write.bind(process.stderr);
}

function restoreStdOut() {
  process.stdout.write = origWrite;
  origWrite = undefined;
}
