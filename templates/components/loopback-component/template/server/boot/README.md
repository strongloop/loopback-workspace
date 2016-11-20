The boot directory can contain scripts to be executed during the app boot 
process. 

The script should export a function as:

```js
module.exports = function(app, component) {
...
}
```

If the script needs to be executed asynchronously, add the callback argument:

```js
module.exports = function(app, component, callback) {
...
}
```