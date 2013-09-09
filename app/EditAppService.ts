///<reference path="DocumentsService.ts" />

module EmbeddedMarkdown.Editor {

  /**
   * Service for providing the services common to the edit app
   */
  export class EditAppService {

    public documents: DocumentsService;

    public static instance: EditAppService;

    constructor(
        public editors: any,
        public actions: any,
        private $stateParams: any
        ) {

      this.documents = new DocumentsService();
      EditAppService.instance = this;
    }

    public get state(): any {
      return this.$stateParams;
    }
  }

}