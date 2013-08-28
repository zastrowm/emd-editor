///<reference path="AppController.ts" />
///<reference path="../EmdDocument.ts" />
///<reference path="../../def/jquery.d.ts" />


module EMD.Editor {

  /**
   * Handles the images
   */
  export class ImagesController {
    private appController: AppController;

    /**
     * Create a new menu controller
     * @param $scope the scope for which the controller is active
     */
    constructor($scope: any, private actions) {
      this.appController = <AppController>(<any>$scope.$parent).controller;

      $scope.controller = this;
    }

    private handleImageClick(image: EMD.Image) {
      this.actions.go("images.edit", {id: image.name});
    }

    public handleFileSelect(files: FileList) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.type.indexOf('image/') !== 0)
         continue;

        this.addFile(file);
      }
    }

    private addFile(file) {
      this.convertBlockToBase64(file, base64 => {
        this.addFileWithName(file, file.name, base64);
      });
    }

    private addFileWithName(file: File, filename: string, data: string) {

      filename = decodeURI(filename);

      var indexOfPeriod = filename.lastIndexOf('.');
      if (indexOfPeriod == -1)
        return;

      var extension = filename.substr(indexOfPeriod + 1).toLowerCase();
      var name = filename.substring(0, indexOfPeriod);

      switch (extension) {
        case "png":
        case "jpeg":
        case "jpg":
        case "bmp":
          break;
        default:
          return;
      }

      var document = this.appController.document;

      var testName = name + "." + extension;

      var i = 2;
      while (document.containsImageWithName(testName)) {
        testName = name + " (" + i + ")"+ "." + extension;
        i++;

        // make sure we don't enter infinite loop
        if (i > 100000) {
          return;
        }
      }

      filename = testName;

      var newImage = new EMD.Image(filename, "data:image/" + extension + ";base64," + data);


    // refresh the image list
      document.addImage(newImage);
      this.appController.refreshImages();
    }

    /**
     * Invoked when the file the user would like to upload has changed
     */
    private handleFileChanged(element: HTMLInputElement) {

      var files = element.files;

      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        this.addFile(file);
      }
    }

    /**
     * Convert a blob to a base64 string
     * @param blob the blob to convert
     * @param callback the callback that gets executed with the first argument
     * containing the converted base64 string
     */
    private convertBlockToBase64(blob, callback) {
      var reader = new FileReader();
      reader.onload = () => {
        var dataUrl = reader.result;
        var base64 = dataUrl.split(',')[1];
        callback(base64);
      };
      reader.readAsDataURL(blob);
    }
  }

}
