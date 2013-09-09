
module EmbeddedMarkdown {

  /**
   * Contains a typed object along with the name of the object
   */
  class NamedItem<T> {

    /**
     * Constructor
     * @param name The item that is held
     * @param item The name of the item
     */
    constructor(public name: string, public item: T) {

    }
  }

  /**
   * A collection of items that have a name and can be retrieved by their name
   */
  export class NamedList<T> {

    private hash: any;

    /**
     * All of the items contained in this list
     */
    public items: T[];

    /**
     * Create a new named list
     * @param isCaseSensitive whether the names of the items are case sensitive
     */
    constructor(public isCaseSensitive: boolean = false) {
      this.items = [];
      this.hash = {};
    }

    /**
     * Add a new item to the collection
     * @param name the name of the item
     * @param item the item to add to the collection
     * @returns {*} the item that was added to the collection
     */
    public add(name: string, item: T): T {

      if (this.contains(name)) {
        throw new Error("Collection already contains item with that name");
      }

      // add it to the item array and add it to the hash list
      this.items.push(<T>item);

      this.hash[this.formatName(name)] = item;

      return item;
    }

    /**
     * Add the named-item, or set the value to the item passed in if it already exists
     * @param name the name of the item
     * @param item the item to add to the collection
     * @returns {*} the item that was added to the collection
     */
    public set(name: string, item: T): T {
      this.removeByName(name);
      return this.add(name, item);
    }

    /**
     * Get all of the names that are stored in the list
     */
    public names(): string[] {
      return Object.keys(this.items);
    }

    /**
     * Remove the item from the collection
     * @param item the item to remove from the collection
     * @returns {*} the item that was removed, or null if the item did not exist
     * in the collection
     * @remarks differs from removeByName as it does a reference lookup rather than
     * a name lookup
     */
    public remove(item: T): T {
      var name = this.getName(item);

      return this.removeByName(name);
    }

    /**
     * Remove an item by its name
     * @param name the name of the item to remove from the collection
     * @returns {*} the item that was removed, or null if the item did not exist
     * in the collection
     */
    public removeByName(name: string): T {
      name = this.formatName(name);

      // hash checking should be fast
      if (!this.contains(name))
        return null;

      var actualItem = this.hash[name];
      for (var i = 0; i < this.items.length; i++) {
        var item = <T>this.items[i];
        if (actualItem == item) {
          // found it!
          return this.removeAtIndex(i, name);
        }
      }

      // not found (why NOT!?!)
      return null;
    }

    /**
     * Remove the designated item at the specified index
     * @param i the index at which to remove
     * @param name the name of the item in the hashmap to remove.  Already formatted
     * @returns {*} the item that was removed
     */
    private removeAtIndex(i: number, name: string): T {
      var item = this.items.splice(i, 1)[0];
      delete this.hash[name];
      return item;
    }

    /**
     * Check if an item with the designated name exists
     * @param name the name of the item to check for existence of
     * @returns {*} true if the item is contained in the list
     */
    public contains(name: string): boolean {
      name = this.formatName(name);

      return this.hash.hasOwnProperty(name);
    }

    /**
     * Get the item associated with the name
     * @param name the name of the item to retrieve
     * @returns {*} the item associated with the name
     */
    public get(name: string): T {
      var name = this.formatName(name);
      return this.contains(name) ? this.hash[name] : null;
    }

    /**
     * Get the name associated with an item
     * @param item the item to get the name associated with the item
     * @returns the name of the item if it exists in the collection, else null
     */
    public getName(item: T): string {
      for (var key in this.hash) {
        if (!this.hash.hasOwnProperty(key))
          continue;

        if (this.hash[key] == item) {
          return key;
        }
      }

      return null;
    }

    /**
     * Convert the name to lowercase if needed
     * @param name the name to convert
     * @returns {string} the name, lowercased if needed, otherwise the original name
     */
    private formatName(name: string): string {
      if (!this.isCaseSensitive) {
        return name.toLowerCase();
      }

      return name;
    }
  }

}