///<reference path="../Config.ts" />
///<reference path="../../def/angular.d.ts" />
///<reference path="../EditAppService.ts" />

module EmbeddedMarkdown.Editor {

  /**
   * Base class for controllers
   */
  export class Controller {

    public app: EditAppService;

    constructor(public $scope: any, public name: string = "controller") {
      $scope[name] = this;

      $scope.handleButtonAction = (name: string) => {
        this.handleClick(name);
      }

      this.initialize(EditAppService.instance);
    }


    private handleClick(name: string) {
      var action = this[name];

      if (action == null) {
        throw new Error("No handler '" + name + "' found");
      } else {
        action.apply(this);
      }
    }

    public apply() {
      this.$scope.$apply();
    }

    /**
     * Go to the specified action
     * @param actionName the action to go to
     * @param data any data associated with the action
     */
    public go(actionName: string, data: any = null) {
      this.app.actions.go(actionName, data);
    }

    private initialize(editApp) {
      this.app = editApp;
    }

  }

}