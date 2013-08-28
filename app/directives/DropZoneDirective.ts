
///<reference path="../../def/angular.d.ts" />
///<reference path="../../def/angular.d.ts" />
///<reference path="../Config.ts" />

module EMD.Editor {

  emdEditorModule.directive("dropzone", function( $parse ) {

    var dropzone = {

      restrict : "A",

      /**
       * Link the element to its functionality
       * @param $scope the current scope of the element
       * @param $element the element that is being hooked up
       * @param $attributes the atttributes for the element
       */
      link: function ($scope: any, $element: any, $attributes: any) {
        // create a function from the "onfiledrop" attribute
        var ondrop = $parse($attributes.onfiledrop)

        // on drop, call the ondrop method with the files
        $element.bind('drop', (evt) => {
          // jquery event
          evt.stopPropagation();
          evt.preventDefault();

          // convert it to the natural event
          evt = <MouseEvent>(evt.originalEvent);

          if (evt.dataTransfer != null
              && evt.dataTransfer.files != null
              && evt.dataTransfer.files.length > 0)
          {
            var files: FileList = evt.dataTransfer.files;
            ondrop($scope, {files: files});
          }
        });
      }
    }

    return dropzone;
  });

  /*
    Have dragdrop for the entire app setup (this allows file drops to not
    cause the UI to change
   */
  $(function() {
    var dropZone = document.getElementsByTagName("body")[0];
    dropZone.addEventListener('dragover', evt => {
      evt.stopPropagation();
      evt.preventDefault();
    }, false);
    dropZone.addEventListener('drop', evt => {
      evt.stopPropagation();
      evt.preventDefault();
      console.log(evt.target)
    }, false);
  });


}