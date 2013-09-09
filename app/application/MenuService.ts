

module Application {

  /**
   * Allows controllers to create menu items associated with an action or callback
   */
  export class MenuService implements IMenuItem {

    /**
     * Un-used
     */
    public text:string = "";

    /**
     * Un-used
     */
    public menus:IMenuItem[];

    /**
     * Require the following paths to the menu items that will be created
     * with the returned MenuBuilder
     */
    public require(...paths:string[]):MenuBuilder {
      if (paths.length === 0) {
        throw new Error("Cannot create top level click menu items");
      }

      var menus = this.menus;
      var menuItem:ParentMenuItem = null;

      while (paths.length > 0) {
        var path:string = <string>paths.splice(0, 1)[0];
        menuItem = this.getOrCreateMenuItemByName(menus, path);
        menus = menuItem.children;
      }

      return menuItem.builder;
    }

    /**
     * Get the menu item with the given name (that is also a ParentMenuItem), or
     * create a new ParentMenuItem and append it to the list
     * @param menus the list of menu items to search
     * @param name the name of the item to search for (or create)
     */
    private getOrCreateMenuItemByName(menus:IMenuItem[], name:string):ParentMenuItem {
      for (var i = 0; i < menus.length; i++) {
        if (menus[i].text === name && menus[i] instanceof ParentMenuItem) {
          return <ParentMenuItem>menus[i];
        }
      }

      var newItem = new ParentMenuItem(this, name);
      menus.push(newItem);
      return newItem;
    }

    /**
     * Execute the action associated with the string
     * @param action the name of the action to execute
     */
    public executeAction(action:string) {

    }

  }

  /**
   * Wraps a menu item so that new items can be added
   */
  export class MenuBuilder {

    /**
     * Create a new MenuBuilder
     * @param system the MenuService for the menu builder
     * @param menu the menu that this builder wraps
     */
    constructor(private system:MenuService, private menu:ParentMenuItem) {

    }

    put(text:string, action:() => void):void;
    put(text:string, actionName:string):void;
    put(text:string, theAction:any):void {
      var action:() => void;
      if (theAction instanceof String) {
        action = () => this.system.executeAction(theAction);
      } else {
        action = theAction;
      }

      var item = new ClickMenuItem(text, action);
      this.menu.children.push(item);
    }
  }

  /**
   * A single item as part of menu that has either an action or callback
   * associated with it.
   */
  export interface IMenuItem {
    text: string;
  }

  /**
   * A menu item which has children menu items
   */
  export class ParentMenuItem implements IMenuItem {
    /**
     * All of the children items of this menu
     */
    public children:IMenuItem[];

    /**
     * The builder for this menu
     */
    public builder: MenuBuilder;

    /**
     * Create a new instance of a menu item that can contain other menu items
     * @param text the display text of the menu item
     */
    constructor(service: MenuService, public text:string) {
      this.children = [];
      this.builder = new MenuBuilder(service, this);
    }
  }

  /**
   * A menu item which does not contain children and performs an action when clicked
   */
  export class ClickMenuItem implements IMenuItem {

    /**
     * Create a new ClickMenuItem
     * @param text the display text of the menu item
     * @param the action to perform when the item is clicked
     */
    constructor(public text:string, public action:() => void) {

    }

  }
}

