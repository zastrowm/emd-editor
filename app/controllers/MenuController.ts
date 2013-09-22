///<reference path="AppController.ts" />
///<reference path="../MarkdownEditor.ts" />

module EMD.Editor {

  /**
   * Handles all menus for the app
   */
  export class MenuController {

    private appController: AppController;
    private scope: any;
    private $state: any;

    /**
     * Create a new menu controller
     * @param $scope the scope for which the controller is active
     */
    constructor($scope: any, $state: any) {



      this.appController = <AppController>(<any>$scope.$parent).controller;
      this.scope = $scope;
      this.$state = $state;

      var menu = new Menu();
      var fileMenu = menu.addMenu("File");
      fileMenu.addChild("Open", () => this.goto("open"));
      fileMenu.addChild("Save", () => this.save());
      fileMenu.addChild("Download", () => this.download());

      var editMenu = menu.addMenu("Edit");
      editMenu.addChild("Undo", () => this.undo(true));
      editMenu.addChild("Redo", () => this.undo(false));

      var documentMenu = menu.addMenu("Document");
      documentMenu.addChild("Images", () => this.goto("images"));

      $scope.menu = menu;
      $scope.focused = false;

      $scope.handleTopLevelClick = () => this.handleTopLevelClick();

      $(document.body).click(evt => this.handleBodyClick(evt))
    }

    private goto(actionName: string) {
      this.$state.transitionTo(actionName, {}, { location: true, inherit: true, relative: this.$state.$current })
    }

    private handleTopLevelClick() {
      this.scope.focused = !this.scope.focused;
    }

    private handleBodyClick(evt) {
      if (!$(evt.target).hasClass('top-level')){
        this.scope.focused = false;
        this.scope.$apply();
      }
    }

    /**
     * Undo or redo
     * @param doUndo true to undo, false to redo
     */
    private undo(doUndo: boolean) {
      this.appController.doUndo(doUndo);
    }

    /**
     * Save the current document
     */
    private save() {
      this.appController.saveSession();
    }

    /**
     * Download the current document
     */
    private download() {
      this.appController.downloadFile()
    }
  }

  /**
   * Represents a top-level menu item
   */
  class Menu {

    /**
     * All of the items in the menu
     */
    public items: MenuItem[];

    /**
     * Default constructor
     */
    constructor() {
      this.items = [];
    }

    /**
     * Create a new top-level menu item
     * @param name the name of the top level item to add
     * @returns {EMD.Editor.MenuItem} the menu item that was created
     */
    addMenu(name: string) : MenuItem {
      var item = new MenuItem(name);
      this.items.push(item);
      return item;
    }
  }

  /**
   * A menu item that contains other child menu items
   */
  class MenuItem {

    public children: {
      text: string;
      callback: () => void;
    }[];

    /**
     * Create a new top-level menu item
     * @param name the name of the menu item
     */
    constructor(public name: string) {
      this.children = [];
    }

    /**
     * Add a new child item to the top-level menu
     * @param name the name of the menu item
     * @param callback the action to perform with the item is clicked
     */
    addChild(name: string, callback: () => void): any {
      var item = {
        text: name,
        callback: callback
      };
      this.children.push(item);
      return item;
    }
  }
}