'use strict';
const fsUtility = require('../component/datamodel/util/file-utility');
class WorkspaceHandler {
  static loadWorkspace(workspace, cb) {
    const modelFiles = [];
    const erroredFiles = [];
    function listOfFiles(next) {
      fsUtility.getConfigFiles(workspace.directory, function(err, files) {
        if (err) return next(err);
        modelFiles = files['Models'];
        next();
      });
    };

    const taskList = [listOfFiles];
    modelFiles.forEach(function(filePath) {
      taskList.push(function(next) {
        fsUtility.readFile(filePath, function(err, fileData) {
          if (err) return next(null, err);
          workspace.loadModel(filePath, fileData, function(err) {
            if (err) erroredFiles.push(err);
          });
        });
      });
    });

    function callback(err, results) {
      if (err) return cb(err);
      const response = {workspaceId: workspace.getId()};
      response.errors = erroredFiles;
      cb(null, response);
    };
    workspace.execute(taskList, callback);
  }
}

module.exports = WorkspaceHandler;
