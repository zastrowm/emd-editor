///<reference path="../EmdDocument.ts"/>
///<reference path="../MarkdownConverter.ts" />
///<reference path="../MarkdownEditor.ts" />
///<reference path="../utils/DragDropHelper.ts" />
///<reference path="../Config.ts" />
///<reference path="../application/files/FileSystem.ts" />

///<reference path="../../def/jquery.d.ts" />
///<reference path="../../def/angular.d.ts" />
///<reference path="../../def/ace.d.ts" />

module EMD.Editor {

  export interface EditorsService {
    markdownEditor: AceAjax.Editor;
  }

  /**
   *  The main angular controller
   */
  export class AppController {

    private scope: any;
    private editor: AceAjax.Editor;
    public markdownEditor: EMD.Editor.MarkdownEditor;
    public document: EMD.Document;

    private fileSystem: Application.Files.IFileSystem;

    /**
     * Default constructor
     * @param $scope the Angular Scope
     */
    constructor(
        $rootScope,
        $scope,
        $state,
        editors: EditorsService
        ) {
      $scope.controller = this;

      this.scope = $scope;
      this.fileSystem = Application.Files.FileSystems.get("LocalStorage");

      var aceEditor = editors.markdownEditor;
      var editor = new EMD.Editor.MarkdownEditor(aceEditor.getSession(), $('#app'));
      this.editor = aceEditor;

      this.markdownEditor = editor;

      $scope.initialize = this.initialize;

      $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams) {
        $scope.showPanel = !$state.includes('edit');
      })

      // On load, load up the session
      var anyWindow = window;
      anyWindow.addEventListener('load', () => {

        var lastFile = this.fileSystem.getRootDirectory().getFile("temp");
        if (lastFile.exists()) {
          this.load();
        } else {
          var loader = $("#document-loader");
          $("#document-loader").load(() => {
            this.initialize()
          });

          loader.attr('src', "dmd-example.html");
        }
      }, false);

      //new DragDropHelper(document.body, (evt) => this.handleDrop(evt));
    }

    private handleDrop(evt) {
      var file = evt.dataTransfer.files[0];

      var reader = new FileReader();

      reader.onloadend = () => {
        this.loadFromText(reader.result);
      }

      var text = reader.readAsText(file);
    }

    private loadFromText(text: string) {
      var element = document.createElement("html");
      element.innerHTML = text;
      var doc = EMD.load(element);
      this.markdownEditor.load(doc);
    }

    /**
     * Initialize and load the document
     */
    initialize() {
      var rootElement = <HTMLElement>(<HTMLIFrameElement>$("#document-loader")[0])
          .contentDocument
          .querySelector("html");

      var loadedDoc = EMD.load(rootElement);
      this.loadDocument(loadedDoc);
    }

    private loadDocument(loadedDoc: EMD.Document) {
      this.scope.document = loadedDoc;
      this.document = loadedDoc;

      this.markdownEditor.load(loadedDoc);

      this.scope.$apply();
    }

    public save() {
      var file = this.fileSystem.getRootDirectory().getFile("temp");
      var doc = new EMD.Document();
      var element = this.markdownEditor.save(doc);
      file.save(element.outerHTML);
    }

    public load() {
      var lastFile = this.fileSystem.getRootDirectory().getFile("temp");
      var element = document.createElement("html");
      var fakeElement = document.createElement("html");
      element.appendChild(fakeElement);
      fakeElement.outerHTML = lastFile.load();
      var doc = EMD.load(element);
      this.loadDocument(doc);
    }

    /**
     * Download the file
     */
    downloadFile() {
      var doc = new EMD.Document();
      var html = this.markdownEditor.save(doc);

      var href = "data:text/html," + html.innerHTML;

      this.scope.$broadcast('download', {
        downloadData: href
      })
    }

    /**
     * Perform an undo operation
     * @param doUndo true to undo, false to redo
     */
    doUndo(doUndo: boolean) {
      if (doUndo) {
        this.editor.getSession().getUndoManager().undo();
      } else {
        this.editor.getSession().getUndoManager().redo(false);
      }
    }

    /**
     * Refresh all of the images
     */
    public refreshImages() {
      this.scope.$apply();
    }
  }



}
