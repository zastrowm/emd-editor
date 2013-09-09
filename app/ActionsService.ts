
module EmbeddedMarkdown.Editor {

  export class ActionsService {

    constructor(public $state) {

    }

    go(actionName: string, toParams:any = {}) {
      this.$state.go(actionName, toParams);
    }


  }

}