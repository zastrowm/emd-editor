///<reference path="../EmdDocument.ts"/>
///<reference path="../MarkdownConverter.ts" />
///<reference path="../MarkdownEditor.ts" />
///<reference path="../utils/DragDropHelper.ts" />
///<reference path="../Config.ts" />
///<reference path="../application/files/FileSystem.ts" />
///<reference path="../../emd/EmbeddedMarkdown.ts" />
///<reference path="../../emd/Serializer.ts" />

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
        editors: EditorsService,
        private editApp: any
        ) {
      $scope.controller = this;

      this.scope = $scope;
      this.fileSystem = Application.Files.FileSystems.get("LocalStorage");

      var aceEditor = editors.markdownEditor;
      var editor = new EMD.Editor.MarkdownEditor(
          aceEditor.getSession(),
          $('#app'),
          editApp.documents
      );
      this.editor = aceEditor;
      this.editor.setFontSize("1.1em");
      this.editor.renderer.setShowGutter(false);

      this.markdownEditor = editor;

      $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams) {
        $scope.showPanel = !$state.includes('edit');
      })

      this.loadSession();
    }

    public saveSession() {
      var doc = this.editApp.documents.current.document;

      // add the content/rendered
      doc.parts.set('body', this.markdownEditor.session.getValue());
      doc.renderedHtml = this.markdownEditor.renderElement.html();

      var text = EmbeddedMarkdown.toString(doc);

      this.fileSystem.getRootDirectory().getFile("session").save(text);
    }

    public loadSession() {
      var file = this.fileSystem.getRootDirectory().getFile("session");

      this.editApp.documents.current = new EmbeddedMarkdown.Editor.DocumentWrapper(
          new EmbeddedMarkdown.EmdDocument()
      );

      try {
        if (file == null || !file.exists()) {
          this.editApp.documents.current = new EmbeddedMarkdown.Editor.DocumentWrapper(
              new EmbeddedMarkdown.EmdDocument()
          );
        } else {
          this.editApp.documents.load(file);
          this.editor.session.setValue(this.editApp.documents.current.document.parts.get('body'));
        }
      } catch (e) {
        console.log("Error:" + e);
      }


    }

    /**
     * Download the file
     */
    downloadFile() {

      var doc = this.editApp.documents.current.document;

      // add the content/rendered
      doc.parts.set('body', this.markdownEditor.session.getValue());
      doc.renderedHtml = this.markdownEditor.renderElement.html();

      var text = EmbeddedMarkdown.toString(doc);

      var blob = new Blob([text], {type: "text/html;charset=utf-8"});
      (<any>window).saveAs(blob, "document.emd.html");
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
  }

}
