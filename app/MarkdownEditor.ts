

///<reference path="../def/jquery.d.ts" />
///<reference path="../def/angular.d.ts" />
///<reference path="../def/ace.d.ts" />

///<reference path="MarkdownConverter.ts" />
///<reference path="utils/Timer.ts" />
///<reference path="DocumentsService.ts" />

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

    editorElement: JQuery;
    renderElement: JQuery;
    markdownConvertor: MarkdownConverter;

    /**
     * Create a new editor
     * @param session the session of the ace editor
     * @param editorElement the jquery element which contains the ace editor
     * @param renderElement the jquery element into which the rendered html should be placed
     */
    constructor(
        public session: AceAjax.IEditSession,
        public instanceElement: JQuery,
        private documents: EmbeddedMarkdown.Editor.DocumentsService
        ) {

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
      var _this: MarkdownEditor = this;
      this.renderElement.find('img').each(function() {
        var src = $(this).attr('src');
        this.src = _this.documents.current.getSourceForImage(src);
      });
    }
  }
}