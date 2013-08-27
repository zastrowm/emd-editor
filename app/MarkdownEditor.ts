

///<reference path="../def/jquery.d.ts" />
///<reference path="../def/angular.d.ts" />
///<reference path="../def/ace.d.ts" />

///<reference path="MarkdownConverter.ts" />
///<reference path="utils/Timer.ts" />
///<reference path="EmdDocument.ts"/>

module EMD.Editor {

  var element = <HTMLElement>document.querySelector(".md-editor .editor");

  export enum EditorMode {
    EditorAndPreview,
    EditorOnly,
    Images,
  }

  /**
   * The markdown editor class which controls the editor and the renderer
   */
  export class MarkdownEditor {
    // timer that fires when we want to refresh the renderer
    private timer: Utils.Timer;

    /**
     * The document
     */
    private document: EMD.Document;

    instanceElement:JQuery;
    editorElement: JQuery;
    renderElement: JQuery;
    session: AceAjax.IEditSession;
    markdownConvertor: MarkdownConverter;


    /**
     * Create a new editor
     * @param session the session of the ace editor
     * @param editorElement the jquery element which contains the ace editor
     * @param renderElement the jquery element into which the rendered html should be placed
     */
    constructor(session: AceAjax.IEditSession, instanceElement: JQuery) {
      this.session = session;
      this.instanceElement = instanceElement;
      this.editorElement = instanceElement.find(".markdownEditor");
      this.renderElement = instanceElement.find(".preview iframe").contents().find('html');

      this.markdownConvertor = new MarkdownConverter();

      this.session.setMode("ace/mode/markdown");
      this.session.setUseWrapMode(true);
      this.session.setWrapLimitRange(null, null);

      this.timer = new Utils.Timer(1000, () => this.refreshRendered());

      this.session.on('change', () => {
        this.timer.reset();
      });

      this.timer.reset();
    }

    /**
     * Refresh the rendered markdown
     */
    public refreshRendered() {
      var transformed = this.markdownConvertor.convert(this.session.getValue());

      var style = "<style type='text/css'>" + $("#style-github").text() + "</style>";

      this.renderElement.html(transformed);
      this.renderElement.find('body').append(style);
      var _this = this;
      this.renderElement.find('img').each(function() {
        var src = $(this).attr('src');
        var dataImage = _this.document.getImage(src);

        if (dataImage != null) {
          console.log(dataImage.name)
          this.src = dataImage.data;
        }
      });
    }

    /**
     * Load the data from the document
     * @param doc
     */
    public load(doc: EMD.Document) {
      this.document = doc;
      this.session.setValue(doc.markdown.body);
    }

    /**
     * Save the contents of the editor into the document
     * @param document the document in which to save the editor contents
     */
    public save(document: EMD.Document): HTMLElement {
      document.markdown = {
        body: this.session.getValue()
      }

      document.rendered = {
        body: this.renderElement.html()
      }

      return EMD.save(document);
    }

    public setMode(mode: EditorMode) {
      this.instanceElement.removeClass();

      switch(mode) {
        case EditorMode.EditorAndPreview:
          this.instanceElement.addClass('mode-editAndPreview');
          break;
        case EditorMode.EditorOnly:
          this.instanceElement.addClass('mode-editOnly');
          break;
        case EditorMode.Images:
          this.instanceElement.addClass('mode-images');
          break;
      }
    }
  }
}