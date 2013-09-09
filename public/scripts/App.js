var Application;
(function (Application) {
    (function (Files) {
        /**
        * The path of a file split into multiple parts
        */
        var FilePath = (function () {
            /**
            * Constructor
            * @param directory the directory of the file, without a trailing slash
            * @param name the name of the file that is being pointed to
            * @param extension the extension of the file
            */
            function FilePath(directory, name, extension) {
                this.directory = directory;
                this.name = name;
                this.extension = extension;
            }
            FilePath.prototype.toString = function () {
                var all = "";

                if (this.directory != null) {
                    all = this.directory + "/";
                }

                if (this.name != null) {
                    all += this.name;
                }

                if (this.extension != null) {
                    all += "." + this.extension;
                }

                return all;
            };
            return FilePath;
        })();
        Files.FilePath = FilePath;
    })(Application.Files || (Application.Files = {}));
    var Files = Application.Files;
})(Application || (Application = {}));
var Application;
(function (Application) {
    ///<reference path="FilePath.ts" />
    (function (Files) {
        /**
        * Filename/path utilities
        */
        var Path = (function () {
            function Path() {
            }
            Path.normalizeSlashes = /**
            * Normalize the slashes in a path
            */
            function (path) {
                return path.replace(/\\/g, "/");
            };

            Path.parseFilePath = /**
            * Convert a path to a FilePath
            * @param path the path to parse
            * @returns {Application.Files.FilePath}
            */
            function (path) {
                if (path == null) {
                    return new Files.FilePath(null, null, null);
                }

                var directory = null;
                var extension = null;
                var name = null;

                path = Path.normalizeSlashes(path);

                var indexOfSlash = path.lastIndexOf('/');
                if (indexOfSlash != -1) {
                    directory = path.substr(0, indexOfSlash);
                    name = path = path.substr(indexOfSlash + 1);
                }

                var indexOfPeriod = path.lastIndexOf('.');
                if (indexOfPeriod != -1) {
                    extension = path.substr(indexOfPeriod + 1);
                    name = path.substring(0, indexOfPeriod);
                }

                return new Files.FilePath(directory, name, extension);
            };
            return Path;
        })();
        Files.Path = Path;
    })(Application.Files || (Application.Files = {}));
    var Files = Application.Files;
})(Application || (Application = {}));
var Application;
(function (Application) {
    ///<reference path="Path.ts" />
    (function (Files) {
        var FileSystems = (function () {
            function FileSystems() {
            }
            FileSystems.register = /**
            * Register a file system that can be created by clients
            * @param name the name of the file system to register
            * @param fileSystem the filesystem to be added
            */
            function (name, fileSystem) {
                FileSystems.fileSystems[name.toLowerCase()] = fileSystem;
            };

            FileSystems.get = /**
            * Get the file system associated with the name
            * @param name the name of the file system to retrieve
            */
            function (name) {
                return FileSystems.fileSystems[name.toLowerCase()];
            };

            FileSystems.allRegistered = /**
            * Return an array of all registered file systems
            * @returns {Array} an array of all registered file systems
            */
            function () {
                var list = [];

                var fss = FileSystems.fileSystems;

                Object.keys(fss).forEach(function (key) {
                    list.push({
                        name: key,
                        system: fss[key]
                    });
                });

                return list;
            };
            FileSystems.fileSystems = {};
            return FileSystems;
        })();
        Files.FileSystems = FileSystems;

        (function (FileSystemSupport) {
            FileSystemSupport[FileSystemSupport["FileRename"] = 0] = "FileRename";
            FileSystemSupport[FileSystemSupport["FileDelete"] = 1] = "FileDelete";
            FileSystemSupport[FileSystemSupport["CreateDirectory"] = 2] = "CreateDirectory";
        })(Files.FileSystemSupport || (Files.FileSystemSupport = {}));
        var FileSystemSupport = Files.FileSystemSupport;
    })(Application.Files || (Application.Files = {}));
    var Files = Application.Files;
})(Application || (Application = {}));
var Application;
(function (Application) {
    (function (Files) {
        ///<reference path="FileSystem.ts" />
        (function (LocalStorage) {
            var fs = Application.Files;

            /**
            * File system impelmentation for local storage
            */
            var FileSystem = (function () {
                function FileSystem() {
                    /**
                    * The name of the root directory is, '/'
                    */
                    this.name = "/";
                }
                /**
                * Constructor
                */
                FileSystem.prototype.constructor = function () {
                };

                /* Interface Implementation */
                FileSystem.prototype.supports = function (feature) {
                    switch (feature) {
                        case fs.FileSystemSupport.CreateDirectory:
                            return false;
                        case fs.FileSystemSupport.FileDelete:
                            return true;
                        case fs.FileSystemSupport.FileRename:
                            return true;
                        default:
                            return false;
                    }
                };

                /* Interface Implementation */
                FileSystem.prototype.isValidFilename = function (fileName) {
                    return /^[a-z0-9 \-\._]+$/i.test(fileName);
                };

                /* Interface Implementation */
                FileSystem.prototype.getRootDirectory = function () {
                    return this;
                };

                /* Interface Implementation */
                /* Return no other directories */
                FileSystem.prototype.getDirectories = function () {
                    return [];
                };

                /* Interface Implementation */
                FileSystem.prototype.getFiles = function () {
                    var files = [];

                    for (var i = 0; i < localStorage.length; i++) {
                        var key = localStorage.key(i);
                        if (key.indexOf(FileSystem.filePrefix) == 0) {
                            files.push(new TextFile(key));
                        }
                    }

                    return files;
                };

                /* Interface Implementation */
                FileSystem.prototype.getFile = function (name) {
                    return new TextFile(FileSystem.filePrefix + name);
                };
                FileSystem.filePrefix = "file-";
                return FileSystem;
            })();
            LocalStorage.FileSystem = FileSystem;

            /**
            * Local storage text file
            */
            var TextFile = (function () {
                /**
                * Create a new text file
                * @param key the key associated with the file (the name is derivied by subtracting
                * the common prefix
                */
                function TextFile(key) {
                    this.key = key;
                    this.name = key.substr(FileSystem.filePrefix.length);
                }
                /* Interface Implementation */
                TextFile.prototype.save = function (content) {
                    localStorage.setItem(this.key, content);
                };

                /* Interface Implementation */
                TextFile.prototype.load = function () {
                    return localStorage.getItem(this.key);
                };

                /* Interface Implementation */
                TextFile.prototype.rename = function (name) {
                    var otherFile = new TextFile(FileSystem.filePrefix + name);
                    if (otherFile.exists()) {
                        throw new Error("Cannot override file!");
                    }

                    var content = this.load();
                    otherFile.save(content);
                    this.delete();

                    return otherFile;
                };

                /* Interface Implementation */
                TextFile.prototype.exists = function () {
                    return localStorage.getItem(this.key);
                };

                /* Interface Implementation */
                TextFile.prototype.delete = function () {
                    localStorage.removeItem(this.key);
                };
                return TextFile;
            })();

            Files.FileSystems.register("LocalStorage", new FileSystem());
        })(Files.LocalStorage || (Files.LocalStorage = {}));
        var LocalStorage = Files.LocalStorage;
    })(Application.Files || (Application.Files = {}));
    var Files = Application.Files;
})(Application || (Application = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    /**
    * Contains a typed object along with the name of the object
    */
    var NamedItem = (function () {
        /**
        * Constructor
        * @param name The item that is held
        * @param item The name of the item
        */
        function NamedItem(name, item) {
            this.name = name;
            this.item = item;
        }
        return NamedItem;
    })();

    /**
    * A collection of items that have a name and can be retrieved by their name
    */
    var NamedList = (function () {
        /**
        * Create a new named list
        * @param isCaseSensitive whether the names of the items are case sensitive
        */
        function NamedList(isCaseSensitive) {
            if (typeof isCaseSensitive === "undefined") { isCaseSensitive = false; }
            this.isCaseSensitive = isCaseSensitive;
            this.items = [];
            this.hash = {};
        }
        /**
        * Add a new item to the collection
        * @param name the name of the item
        * @param item the item to add to the collection
        * @returns {*} the item that was added to the collection
        */
        NamedList.prototype.add = function (name, item) {
            if (this.contains(name)) {
                throw new Error("Collection already contains item with that name");
            }

            // add it to the item array and add it to the hash list
            this.items.push(item);

            this.hash[this.formatName(name)] = item;

            return item;
        };

        /**
        * Add the named-item, or set the value to the item passed in if it already exists
        * @param name the name of the item
        * @param item the item to add to the collection
        * @returns {*} the item that was added to the collection
        */
        NamedList.prototype.set = function (name, item) {
            this.removeByName(name);
            return this.add(name, item);
        };

        /**
        * Get all of the names that are stored in the list
        */
        NamedList.prototype.names = function () {
            return Object.keys(this.items);
        };

        /**
        * Remove the item from the collection
        * @param item the item to remove from the collection
        * @returns {*} the item that was removed, or null if the item did not exist
        * in the collection
        * @remarks differs from removeByName as it does a reference lookup rather than
        * a name lookup
        */
        NamedList.prototype.remove = function (item) {
            var name = this.getName(item);

            return this.removeByName(name);
        };

        /**
        * Remove an item by its name
        * @param name the name of the item to remove from the collection
        * @returns {*} the item that was removed, or null if the item did not exist
        * in the collection
        */
        NamedList.prototype.removeByName = function (name) {
            name = this.formatName(name);

            if (!this.contains(name))
                return null;

            var actualItem = this.hash[name];
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];
                if (actualItem == item) {
                    // found it!
                    return this.removeAtIndex(i, name);
                }
            }

            // not found (why NOT!?!)
            return null;
        };

        /**
        * Remove the designated item at the specified index
        * @param i the index at which to remove
        * @param name the name of the item in the hashmap to remove.  Already formatted
        * @returns {*} the item that was removed
        */
        NamedList.prototype.removeAtIndex = function (i, name) {
            var item = this.items.splice(i, 1)[0];
            delete this.hash[name];
            return item;
        };

        /**
        * Check if an item with the designated name exists
        * @param name the name of the item to check for existence of
        * @returns {*} true if the item is contained in the list
        */
        NamedList.prototype.contains = function (name) {
            name = this.formatName(name);

            return this.hash.hasOwnProperty(name);
        };

        /**
        * Get the item associated with the name
        * @param name the name of the item to retrieve
        * @returns {*} the item associated with the name
        */
        NamedList.prototype.get = function (name) {
            var name = this.formatName(name);
            return this.contains(name) ? this.hash[name] : null;
        };

        /**
        * Get the name associated with an item
        * @param item the item to get the name associated with the item
        * @returns the name of the item if it exists in the collection, else null
        */
        NamedList.prototype.getName = function (item) {
            for (var key in this.hash) {
                if (!this.hash.hasOwnProperty(key))
                    continue;

                if (this.hash[key] == item) {
                    return key;
                }
            }

            return null;
        };

        /**
        * Convert the name to lowercase if needed
        * @param name the name to convert
        * @returns {string} the name, lowercased if needed, otherwise the original name
        */
        NamedList.prototype.formatName = function (name) {
            if (!this.isCaseSensitive) {
                return name.toLowerCase();
            }

            return name;
        };
        return NamedList;
    })();
    EmbeddedMarkdown.NamedList = NamedList;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
///<reference path="NamedList.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    /**
    * Allows interacting with a document format specified by the Embedded-Markdown document standard
    */
    var EmdDocument = (function () {
        /**
        * Create a new empty document
        */
        function EmdDocument() {
            this.images = new EmbeddedMarkdown.NamedList(false);
            this.styleComponents = new EmbeddedMarkdown.NamedList(false);
            this.scriptComponents = new EmbeddedMarkdown.NamedList(false);
            this.parts = new EmbeddedMarkdown.NamedList(false);
            this.meta = {};
            this.version = new Version(0, 1);
        }
        return EmdDocument;
    })();
    EmbeddedMarkdown.EmdDocument = EmdDocument;

    var Version = (function () {
        /**
        * Constructor
        * @param major the major part of the version
        * @param minor the minor part of the version
        */
        function Version(major, minor) {
            this._major = major | 0;
            this._minor = minor | 0;
        }
        Object.defineProperty(Version.prototype, "major", {
            get: /**
            * The major version
            */
            function () {
                return this._major;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Version.prototype, "minor", {
            get: /**
            * The minor version
            */
            function () {
                return this._major;
            },
            enumerable: true,
            configurable: true
        });

        /**
        * Convert the version to a string matching the format of {major}.{minor}
        * @returns {string} the version as a string
        */
        Version.prototype.toString = function () {
            return this._major + "." + this._minor;
        };

        /**
        * Compare to another version
        * @param rhs the other version to compare against
        * @returns {number}
        *    < 0 => this < rhs
        *    0   => this == rhs
        *    > 0 => this > rhs
        */
        Version.prototype.compareTo = function (rhs) {
            if (this._major == rhs._major) {
                return this._minor - rhs._major;
            } else {
                return this._major - rhs._major;
            }
        };

        /**
        * Check if this version is equal to another version
        * @param rhs the version to compare against
        * @returns {boolean} true if this.compareTo(rhs) == 0
        */
        Version.prototype.equals = function (rhs) {
            return this.compareTo(rhs) == 0;
        };

        Version.fromString = /**
        * Convert a string into a typed Version object
        * @param version a string in the {0}.{1} format
        */
        function (version) {
            var regex = /^([0-9]+)\.([0-9])+$/;

            if (!version.match(regex))
                throw new Error("Version string must be in a format of {major}.{minor} (for example, '1.3')");

            var info = regex.exec(version);
            return new Version(parseInt(info[1]), parseInt(info[2]));
        };
        return Version;
    })();
    EmbeddedMarkdown.Version = Version;

    /**
    * An item that contains both a name and data for the item
    */
    var NamedItemWithData = (function () {
        /**
        * Create a new image
        * @param name the name of the item
        * @param data the data associated with the item
        */
        function NamedItemWithData(name, data) {
            this._name = name;
            this._data = data;
        }
        Object.defineProperty(NamedItemWithData.prototype, "name", {
            get: /**
            * The name of the item
            */
            function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(NamedItemWithData.prototype, "data", {
            get: /**
            * The data associated with the item
            */
            function () {
                return this._data;
            },
            enumerable: true,
            configurable: true
        });
        return NamedItemWithData;
    })();
    EmbeddedMarkdown.NamedItemWithData = NamedItemWithData;

    /**
    * A group of css styles with a name.  The data associated with the item is the css style
    */
    var StyleComponent = (function (_super) {
        __extends(StyleComponent, _super);
        /**
        * Create a new image
        * @param name the name of the component
        * @param data the css style associated with the component
        */
        function StyleComponent(name, data) {
            _super.call(this, name, data);
        }
        return StyleComponent;
    })(NamedItemWithData);
    EmbeddedMarkdown.StyleComponent = StyleComponent;

    /**
    * A script which operates in the context of the rendered document.The data associated with
    * the item is the script in question
    */
    var ScriptComponent = (function (_super) {
        __extends(ScriptComponent, _super);
        /**
        * Create a new image
        * @param name the name of the script type
        * @param script the script code
        */
        function ScriptComponent(name, script) {
            _super.call(this, name, script);
        }
        return ScriptComponent;
    })(NamedItemWithData);
    EmbeddedMarkdown.ScriptComponent = ScriptComponent;

    /**
    * An image with a given name. The data associated with the item is the base64 encoded src of the
    * image.
    */
    var Image = (function (_super) {
        __extends(Image, _super);
        /**
        * Create a new image
        * @param name the name of the image
        * @param data the src of the image, base64 encoded
        */
        function Image(name, data) {
            _super.call(this, name, data);
        }
        return Image;
    })(NamedItemWithData);
    EmbeddedMarkdown.Image = Image;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    ///<reference path="../emd/EmbeddedMarkdown.ts" />
    (function (Editor) {
        /**
        * Wraps an Embedded Markdown document and provides convenience methods for interacting
        * with it
        */
        var DocumentWrapper = (function () {
            /**
            * @param document the document to wrap
            */
            function DocumentWrapper(document) {
                this.document = document;
            }
            Object.defineProperty(DocumentWrapper.prototype, "images", {
                get: /**
                * All of the images in the document
                * @returns {EmbeddedMarkdown.Image[]}
                */
                function () {
                    return this.document.images.items;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Get the src string for an image so that it may be displayed to the user
            * @param image the image to display
            * @returns the src url so that a browser may display the image
            */
            DocumentWrapper.prototype.getSourceForImage = function (imageName) {
                var image = this.document.images.get(imageName);

                if (image == null) {
                    return imageName;
                } else {
                    return image.data;
                }
            };
            return DocumentWrapper;
        })();
        Editor.DocumentWrapper = DocumentWrapper;
    })(EmbeddedMarkdown.Editor || (EmbeddedMarkdown.Editor = {}));
    var Editor = EmbeddedMarkdown.Editor;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
var Hexpect;
(function (Hexpect) {
    function trimRight(str) {
        return str.replace(/\s+$/g, '');
    }

    function sortIgnoreCase(array, selector) {
        function stringCompare(a, b) {
            if (a.toLowerCase() < b.toLowerCase())
                return -1;
            if (a.toLowerCase() > b.toLowerCase())
                return 1;

            return 0;
        }

        array.sort(function (a, b) {
            return stringCompare(selector(a), selector(b));
        });
    }

    /**
    * An item which can be validated against an html element to check for correctness
    */
    var Element = (function () {
        /**
        * Create a new element from a token
        * @param token the token containing all element information
        */
        function Element(token) {
            /**
            * The children that are required of this element
            */
            this.children = [];
            /**
            * The attributes that are required on this element
            */
            this.attributes = [];
            this.name = token.name;
            this.isRequired = true;

            if (token.hasValue)
                token.throw("Elements cannot have values associated with them");

            switch (token.postFix) {
                case "*":
                    this.isRequired = false;
                case "+":
                    this.allowDuplicates = true;
                    break;
                case "":
                    break;
                default:
                    throw token.throw("Invalid character following name of element");
            }
        }
        /**
        * Convert the element to a string representation
        * @returns {string}
        */
        Element.prototype.toString = function () {
            var atts = this.attributes.map(function (a) {
                return a.value != null ? a.name + "=" + a.value : a.name;
            });

            var path = this.name;

            var parent = this.parent;
            while (parent != null) {
                path = parent.name + ">" + path;
                parent = parent.parent;
            }

            return "{ path=>" + path + ", attributes=>" + atts.join(", ") + "}";
        };

        /**
        * Append a token representing an element or an attribute
        * @returns {*} An element if the token representing an element, null otherwise
        */
        Element.prototype.append = function (token) {
            if (token.isAttribute()) {
                var att = new Attribute(token);
                this.appendAttribute(att, token);
            } else {
                var ele = new Element(token);
                this.appendElement(ele, token);
                return ele;
            }

            return null;
        };

        /**
        * Add a required attribute to the element
        */
        Element.prototype.appendAttribute = function (att, token) {
            if (this.allowExtraElements)
                token.throw("All attributes must be before elements");
            if (this.children.length != 0)
                token.throw("Attributes cannot be after child element was declared");

            for (var i = 0; i < this.attributes.length; i++) {
                var otherAttr = this.attributes[i];
                if (otherAttr.name.toLowerCase() == att.name.toLowerCase())
                    token.throw("Duplicate attribute name");
            }

            this.attributes.push(att);
        };

        /**
        * Add an element as a child of this element
        */
        Element.prototype.appendElement = function (element, token) {
            if (element.name == "**") {
                if (this.allowExtraElements)
                    token.throw("Extra extra elements element");
else
                    this.allowExtraElements = true;
            } else {
                if (this.children == null) {
                    this.children = [];
                }

                this.children.push(element);
                element.parent = this;
            }
        };

        /**
        * Validate an HTML element against a root element
        * @param htmlElement the root html element to validate
        */
        Element.prototype.validate = function (htmlElement) {
            if (htmlElement.tagName.toLowerCase() != this.name.toLowerCase()) {
                this.throw("Expected element " + this + " but got " + htmlElement.tagName, htmlElement);
            }

            this.validateAttributes(htmlElement);

            if (!this.allowExtraElements) {
                this.validateElements(htmlElement);
            }
        };

        Element.prototype.validateAttributes = function (htmlElement) {
            var attributes = Array.prototype.slice.call(htmlElement.attributes, 0);

            sortIgnoreCase(attributes, function (a) {
                return a.nodeName;
            });
            sortIgnoreCase(this.attributes, function (a) {
                return a.name;
            });

            var i = 0, j = 0;

            for (; i < this.attributes.length && j < attributes.length; i++, j++) {
                var expectedAttribute = this.attributes[i];
                var actualAttribute = attributes[j];

                if (expectedAttribute.name.toLowerCase() != actualAttribute.nodeName.toLowerCase())
                    this.throw("Missing attribute " + expectedAttribute.name, htmlElement);

                if (expectedAttribute.value != null && expectedAttribute.value != actualAttribute.nodeValue) {
                    if (expectedAttribute.errorText != null)
                        this.throw(expectedAttribute.errorText, htmlElement);

                    this.throw("Expected attribute " + expectedAttribute.name + " to have value of " + expectedAttribute.value, htmlElement);
                }
            }

            if (i < this.attributes.length)
                this.throw("Missing attribute " + this.attributes[i].name, htmlElement);

            if (j < attributes.length)
                this.throw("Unexpected attribute " + attributes[j].nodeName, htmlElement);
        };

        /**
        * Validate the child elements of this element conform to the requirements
        * @param htmlElement the element element to check
        */
        Element.prototype.validateElements = function (htmlElement) {
            var htmlElementChildIndex = 0;
            var lastWasSatisfied = false;

            for (var elementChildIndex = 0; elementChildIndex < this.children.length;) {
                var childElement = this.children[elementChildIndex];

                if (htmlElementChildIndex >= htmlElement.children.length) {
                    if (childElement.isRequired)
                        this.throw("Missing child element " + childElement, htmlElement);

                    // the next childElement might be required, go directly to the next one
                    elementChildIndex++;
                    continue;
                }

                var htmlChild = htmlElement.children[htmlElementChildIndex];

                if (!childElement.isValidFor(htmlChild)) {
                    if (!childElement.isRequired || lastWasSatisfied) {
                        elementChildIndex++;
                        lastWasSatisfied = false;
                        continue;
                    }
                    // validate below will catch other cases
                }

                // validate it, NOW!
                childElement.validate(htmlChild);

                if (!childElement.allowDuplicates) {
                    elementChildIndex++;
                    lastWasSatisfied = false;
                } else {
                    lastWasSatisfied = true;
                }

                // the element was used up
                htmlElementChildIndex++;
            }

            if (htmlElementChildIndex < htmlElement.children.length) {
                var extra = htmlElement.children[htmlElementChildIndex];
                this.throw("Extra child element " + extra.nodeName + " " + extra.id, extra);
            }
        };

        /**
        * Check if the Element could be considered a match for the htmlElement
        * @param htmlElement the element to check for conformance
        * @returns {boolean} true if the element is a match, false if the element
        * can be ignored
        */
        Element.prototype.isValidFor = function (htmlElement) {
            if (htmlElement.nodeName.toLowerCase() != this.name.toLowerCase())
                return false;

            var attributes = Array.prototype.slice.call(htmlElement.attributes, 0);

            if (attributes.length != this.attributes.length)
                return false;

            function stringCompare(a, b) {
                if (a.toLowerCase() < b.toLowerCase())
                    return -1;
                if (a.toLowerCase() > b.toLowerCase())
                    return 1;
                return 0;
            }

            // sort both so that they're in the same order
            sortIgnoreCase(attributes, function (a) {
                return a.nodeName;
            });
            sortIgnoreCase(this.attributes, function (a) {
                return a.name;
            });

            for (var i = 0; i < attributes.length; i++) {
                if (this.attributes[i].name.toLowerCase() != attributes[i].nodeName.toLowerCase())
                    return false;
            }

            return true;
        };

        Element.prototype.throw = function (errorText, element) {
            var _this = this;
            throw {
                errorText: errorText,
                element: element,
                toString: function () {
                    return "Element error. " + errorText + ". " + _this.toString();
                }
            };
        };
        return Element;
    })();

    /**
    * A single attribute that is required
    */
    var Attribute = (function () {
        /**
        * Create a new attribute from a token
        */
        function Attribute(token) {
            this.name = token.name;
            this.errorText = token.errorText;

            if (token.hasValue) {
                this.value = token.valueText;
            }
        }
        return Attribute;
    })();

    /**
    * Parse a string into an element tree
    * @param content the string content
    * @returns {Element} the root element of the tree
    */
    function parse(content) {
        var tokens = tokenize(content);
        validateTokens(tokens);
        return createTree(tokens);
    }

    /**
    * Convert a text document into an array of tokens
    * @param content the text content to convert
    * @returns {Token[]} the array of tokens representing the lines
    */
    function tokenize(content) {
        // split it into parsable lines
        var lines = content.split(/\r?\n/);

        var tokens = lines.map(function (l) {
            return trimRight(l);
        }).filter(function (l) {
            return l.length != 0;
        }).map(function (l) {
            return {
                line: l.trim(),
                match: parseLine(l)
            };
        });

        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];

            if (token.match == null)
                throw new Error("Invalid line: " + token.line);

            if (token.match.hasValue && token.match.prefix != "@")
                throw new Error("Invalid line (only attributes can have values): " + token.line);
        }

        return tokens.map(function (t) {
            return t.match;
        });
    }

    /**
    * Parse a single line into a token
    * @param line the line to convert (must be in correct format)
    * @returns the parsed line as a Token
    */
    function parseLine(line) {
        var lineRegex = /^(\t*)([@]?)([A-Za-z0-9_\-]+|\*\*)(\*?)(?:(=)(?:"(?:([^"]*?)")))?(?:,(.*))?$/;

        var match = lineRegex.exec(line);

        if (match == null)
            return null;

        var lineMatch = new Token();

        lineMatch.text = line;
        lineMatch.indent = match[1].length;
        lineMatch.prefix = match[2];
        lineMatch.name = match[3];
        lineMatch.postFix = match[4];
        lineMatch.hasValue = match[5] == '=';
        lineMatch.valueText = lineMatch.hasValue ? match[6] : null;
        lineMatch.errorText = match[7];

        return lineMatch;
    }

    /**
    * Create the actual tree of elements
    * @param tokens the tokens that were parsed
    * @returns {Element} the root element created from the tokens
    */
    function createTree(tokens) {
        var root = new Element(tokens[0]);
        if (root.name == "*")
            tokens[0].throw("Invalid root name");

        var stack = [];

        stack.push(root);

        for (var i = 1; i < tokens.length; i++) {
            var token = tokens[i];

            while (token.indent < stack.length) {
                stack.pop();
            }

            // last element on stack is the parent
            var parent = stack[token.indent - 1];

            // child element/attribute
            var element = parent.append(token);

            if (element != null) {
                stack.push(element);
            }
        }

        return root;
    }

    /**
    * Validates that:
    *  - only one root element (the first element with zero indent)
    *  - tokens always increase only by one indent level at a time
    *  - we don't have children of attributes
    *  - the first element is non-indented and that it is not an attribute
    *  - attributes always follow other attributes (and that the previous attribute at the same level)
    */
    function validateTokens(tokens) {
        var lastToken = tokens[0];

        if (lastToken.indent != 0)
            throw new Error("First element must have indent of 0");
        if (lastToken.isAttribute())
            throw new Error("First element cannot be attribute");

        var lastIndent = 0;

        for (var i = 1; i < tokens.length; i++) {
            var token = tokens[i];

            if (token.indent == 0)
                throw new Error('Only first element can be root element: ' + token.text);

            if (token.indent > lastIndent + 1)
                throw new Error("Line has invalid indent: " + token.text);

            var isChild = token.indent == lastToken.indent + 1;
            var isSibling = token.indent == lastToken.indent;

            if (isChild && lastToken.isAttribute()) {
                throw new Error("Cannot have children of attributes: " + token.text);
            }

            if (token.isAttribute()) {
                if (!isChild && !isSibling)
                    throw new Error("Attributes must be the first children of an element: " + token.text);

                if (isSibling && !lastToken.isAttribute())
                    throw new Error("Attributes can only follow other attributes: " + token.text);
            }

            lastIndent = token.indent;
            lastToken = token;
        }
    }

    var Token = (function () {
        function Token() {
        }
        Token.prototype.isAttribute = function () {
            return this.prefix == '@';
        };

        /**
        * Throw an Error with the error text and the line associated with the token
        * @param error the error message
        */
        Token.prototype.throw = function (error) {
            throw new Error(error + ": `" + this.text + "`");
        };
        return Token;
    })();

    /**
    * Validate an HTML element against a root element
    * @param rootElement the root element to validate against
    * @param htmlElement the root html element to validate
    */
    function validate(rootElement, htmlElement) {
        rootElement.validate(htmlElement);
    }

    function createValidator(content) {
        return parse(content);
    }
    Hexpect.createValidator = createValidator;
})(Hexpect || (Hexpect = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    (function (Shim) {
        var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var base64DecodeChars = [
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            62,
            -1,
            -1,
            -1,
            63,
            52,
            53,
            54,
            55,
            56,
            57,
            58,
            59,
            60,
            61,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            13,
            14,
            15,
            16,
            17,
            18,
            19,
            20,
            21,
            22,
            23,
            24,
            25,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            26,
            27,
            28,
            29,
            30,
            31,
            32,
            33,
            34,
            35,
            36,
            37,
            38,
            39,
            40,
            41,
            42,
            43,
            44,
            45,
            46,
            47,
            48,
            49,
            50,
            51,
            -1,
            -1,
            -1,
            -1,
            -1
        ];

        function base64encode(str) {
            var out, i, len;
            var c1, c2, c3;

            len = str.length;
            i = 0;
            out = "";
            while (i < len) {
                c1 = str.charCodeAt(i++) & 0xff;
                if (i == len) {
                    out += base64EncodeChars.charAt(c1 >> 2);
                    out += base64EncodeChars.charAt((c1 & 0x3) << 4);
                    out += "==";
                    break;
                }
                c2 = str.charCodeAt(i++);
                if (i == len) {
                    out += base64EncodeChars.charAt(c1 >> 2);
                    out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                    out += base64EncodeChars.charAt((c2 & 0xF) << 2);
                    out += "=";
                    break;
                }
                c3 = str.charCodeAt(i++);
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
                out += base64EncodeChars.charAt(c3 & 0x3F);
            }
            return out;
        }
        Shim.base64encode = base64encode;

        function base64decode(str) {
            var c1, c2, c3, c4;
            var i, len, out;

            len = str.length;
            i = 0;
            out = "";
            while (i < len) {
                do {
                    c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
                } while(i < len && c1 == -1);
                if (c1 == -1)
                    break;

                do {
                    c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
                } while(i < len && c2 == -1);
                if (c2 == -1)
                    break;

                out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

                do {
                    c3 = str.charCodeAt(i++) & 0xff;
                    if (c3 == 61)
                        return out;
                    c3 = base64DecodeChars[c3];
                } while(i < len && c3 == -1);
                if (c3 == -1)
                    break;

                out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

                do {
                    c4 = str.charCodeAt(i++) & 0xff;
                    if (c4 == 61)
                        return out;
                    c4 = base64DecodeChars[c4];
                } while(i < len && c4 == -1);
                if (c4 == -1)
                    break;
                out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
            }
            return out;
        }
        Shim.base64decode = base64decode;
    })(EmbeddedMarkdown.Shim || (EmbeddedMarkdown.Shim = {}));
    var Shim = EmbeddedMarkdown.Shim;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
///<reference path="EmbeddedMarkdown.ts" />
///<reference path="Hexpect.ts" />
///<reference path="Shim.ts" />
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    function serialize(doc) {
        return Serializer.Serialize(doc);
    }
    EmbeddedMarkdown.serialize = serialize;

    function deserialize(htmlElement) {
        return Serializer.Deserialize(htmlElement);
    }
    EmbeddedMarkdown.deserialize = deserialize;

    function toElement(doc) {
        return Serializer.Serialize(doc);
    }
    EmbeddedMarkdown.toElement = toElement;

    function toString(doc) {
        return toElement(doc).innerHTML;
    }
    EmbeddedMarkdown.toString = toString;

    function fromElement(element) {
        return Serializer.Deserialize(element);
    }
    EmbeddedMarkdown.fromElement = fromElement;

    function fromString(content) {
        var element = document.createElement("html");
        var fakeElement = document.createElement("html");
        element.appendChild(fakeElement);
        fakeElement.outerHTML = content;
        return fromElement(element);
    }
    EmbeddedMarkdown.fromString = fromString;

    function create(definition) {
        var element = document.createElement(definition.tag);

        Object.keys(definition).filter(function (key) {
            return key.indexOf("$") == 0;
        }).forEach(function (key) {
            element.setAttribute(key.substr(1), definition[key]);
        });

        if (definition.children != null) {
            definition.children.forEach(function (child) {
                element.appendChild(create(child));
            });
        } else if (definition.html != null) {
            element.innerHTML = definition.html;
        } else if (definition.text != null) {
            element.textContent = definition.text;
        }

        return element;
    }

    /**
    *  Serializes and deserializes EmdDocuments
    */
    var Serializer = (function () {
        function Serializer() {
        }
        Serializer.Serialize = function (doc) {
            var definition = {
                tag: "HTML",
                "$data-emd-version": doc.version.toString(),
                children: [
                    {
                        tag: "HEAD",
                        children: [
                            {
                                tag: "META",
                                $charset: "utf-8"
                            },
                            {
                                tag: "TITLE",
                                html: "Markdown Document"
                            },
                            {
                                tag: "SCRIPT",
                                $type: "application/json",
                                $id: Serializer.metaDataScriptId,
                                html: JSON.stringify(doc.meta)
                            }
                        ]
                    },
                    {
                        tag: "BODY",
                        children: [
                            {
                                tag: "DIV",
                                $id: "-emd-rendered",
                                html: ""
                            },
                            {
                                tag: "DIV",
                                $id: "-emd-document",
                                $style: "display: none",
                                children: [
                                    {
                                        tag: "DIV",
                                        $id: "-emd-content",
                                        children: doc.parts.items.map(function (item) {
                                            return {
                                                tag: 'SCRIPT',
                                                $type: "text/x-emd-markdown",
                                                //TODO allow extensibility
                                                '$data-emd-name': 'body',
                                                text: EmbeddedMarkdown.Shim.base64encode(item)
                                            };
                                        })
                                    },
                                    {
                                        tag: "DIV",
                                        $id: "-emd-images",
                                        children: doc.images.items.map(function (image) {
                                            return {
                                                tag: "IMG",
                                                '$src': image.data,
                                                '$data-emd-name': image.name,
                                                '$alt': ""
                                            };
                                        })
                                    },
                                    {
                                        tag: "DIV",
                                        $id: "-emd-extra"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            return create(definition);
        };

        Serializer.Deserialize = function (element) {
            Serializer.VerifyConformance(element);

            var strVersion = element.getAttribute(Serializer.versionAttributeName);

            var doc = new EmbeddedMarkdown.EmdDocument();

            //doc.version = Version.fromString(strVersion);
            var get = function (selector) {
                return element.querySelector(selector);
            };
            var gets = function (selector) {
                var result = element.querySelectorAll(selector);
                return Array.prototype.slice.call(result, 0);
            };

            gets("#-emd-content script").forEach(function (e) {
                var script = e;
                var name = script.getAttribute("data-emd-name");
                var content = EmbeddedMarkdown.Shim.base64decode(script.textContent);
                doc.parts.add(name, content);
            });

            gets("#-emd-images img").forEach(function (e) {
                var image = e;
                var name = image.getAttribute("data-emd-name");
                var data = image.getAttribute("src");
                doc.images.add(name, new EmbeddedMarkdown.Image(name, data));
            });

            return doc;
        };

        Serializer.VerifyConformance = function (html) {
            var grammar = '' + 'html\n' + '  head\n' + '    meta\n' + '      @charset="utf-8", Meta tag requires charset of "utf-8"\n' + '    title\n' + '    script\n' + '      @type="application/json"\n' + '      @id="-emd-meta"\n' + '    style*\n' + '      @data-emd-name, Missing name on style tag\n' + '    script*\n' + '      @data-emd-name,\n' + '\n' + '  body\n' + '    div\n' + '      @id="-emd-rendered"\n' + '      **\n' + '    div\n' + '      @id="-emd-document"\n' + '      @style="display: none"\n' + '      div\n' + '        @id="-emd-content"\n' + '        script\n' + '          @type="text/x-emd-markdown"\n' + '          @data-emd-name\n' + '      div\n' + '        @id="-emd-images"\n' + '        img*\n' + '          @data-emd-name\n' + '          @alt=""\n' + '          @src\n' + '      div\n' + '        @id="-emd-extra"\n' + '        **\n' + '';

            grammar = grammar.replace(/  /g, '\t');
            var validator = Hexpect.createValidator(grammar);
            validator.validate(html);
        };

        Serializer.SerializeAndAppend = function (parent, items, serialize) {
            for (var i = 0; i < items.length; i++) {
                var image = items[i];
                parent.appendChild(serialize(image));
            }
        };

        Serializer.SerializeImage = /**
        * Serialize an image into an html element
        * @param image the image to serialize
        * @returns the image, serialized to an html element
        */
        function (image) {
            var element = document.createElement('img');

            element.setAttribute("src", image.data);
            element.setAttribute("alt", "");
            element.setAttribute(Serializer.nameAttributeName, image.name);

            return element;
        };

        Serializer.DeserializeImage = /**
        * Deserialize an html element into an image
        * @param element the element to deserialize into an image
        * @returns the image that was deserialized from the image, or null
        * if the element could not be deserialized
        */
        function (element) {
            if (element.tagName != "IMG")
                return null;

            var src = element.getAttribute("src");
            var name = element.getAttribute(Serializer.nameAttributeName);

            return new EmbeddedMarkdown.Image(name, src);
        };
        Serializer.nameAttributeName = "data-emd-name";
        Serializer.versionAttributeName = "data-emd-version";
        Serializer.metaDataScriptId = "-emd-meta";
        return Serializer;
    })();
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    ///<reference path="DocumentWrapper.ts" />
    ///<reference path="application/files/FileSystem.ts" />
    ///<reference path="../emd/Serializer.ts" />
    (function (Editor) {
        /**
        * Contains the service layer for interacting with documents
        */
        var DocumentsService = (function () {
            function DocumentsService() {
            }
            /**
            * Loads a file to become the current document
            * @file the file to loadSession to become the current document
            */
            DocumentsService.prototype.load = function (file) {
                var doc = EmbeddedMarkdown.fromString(file.load());
                this.current = new Editor.DocumentWrapper(doc);
            };
            return DocumentsService;
        })();
        Editor.DocumentsService = DocumentsService;
    })(EmbeddedMarkdown.Editor || (EmbeddedMarkdown.Editor = {}));
    var Editor = EmbeddedMarkdown.Editor;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    ///<reference path="DocumentsService.ts" />
    (function (Editor) {
        /**
        * Service for providing the services common to the edit app
        */
        var EditAppService = (function () {
            function EditAppService(editors, actions, $stateParams) {
                this.editors = editors;
                this.actions = actions;
                this.$stateParams = $stateParams;
                this.documents = new Editor.DocumentsService();
                EditAppService.instance = this;
            }
            Object.defineProperty(EditAppService.prototype, "state", {
                get: function () {
                    return this.$stateParams;
                },
                enumerable: true,
                configurable: true
            });
            return EditAppService;
        })();
        Editor.EditAppService = EditAppService;
    })(EmbeddedMarkdown.Editor || (EmbeddedMarkdown.Editor = {}));
    var Editor = EmbeddedMarkdown.Editor;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    (function (Editor) {
        var ActionsService = (function () {
            function ActionsService($state) {
                this.$state = $state;
            }
            ActionsService.prototype.go = function (actionName, toParams) {
                if (typeof toParams === "undefined") { toParams = {}; }
                this.$state.go(actionName, toParams);
            };
            return ActionsService;
        })();
        Editor.ActionsService = ActionsService;
    })(EmbeddedMarkdown.Editor || (EmbeddedMarkdown.Editor = {}));
    var Editor = EmbeddedMarkdown.Editor;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
var EMD;
(function (EMD) {
    ///<reference path="application/files/LocalStorage.ts" />
    ///<reference path="EditAppService" />
    ///<reference path="ActionsService.ts" />
    ///<reference path="../def/ace.d.ts" />
    ///<reference path="../def/angular.d.ts" />
    (function (Editor) {
        Editor.emdEditorModule = angular.module('EMD.Editor.App', ['ui.router']);

        Editor.emdEditorModule.factory('editors', function () {
            var EditorsService = {
                markdownEditor: $('#core-editor').data('editor')
            };

            return EditorsService;
        });

        Editor.emdEditorModule.factory('actions', function ($state) {
            return new EmbeddedMarkdown.Editor.ActionsService($state);
        });

        Editor.emdEditorModule.factory("editApp", function (editors, actions, $stateParams) {
            return new EmbeddedMarkdown.Editor.EditAppService(editors, actions, $stateParams);
        });

        Editor.emdEditorModule.config(function ($stateProvider, $urlRouterProvider) {
            //
            // For any unmatched url, send to /
            $urlRouterProvider.otherwise("");

            //
            // Now set up the states
            var state = $stateProvider;

            state = state.state('edit', {
                url: '/edit',
                template: ""
            });

            state = state.state('images', {
                url: "/images",
                templateUrl: "views/images.html"
            });

            state = state.state('images.edit', {
                url: "/edit/:id",
                templateUrl: "views/images.edit.html"
            });

            state = state.state('images.edit.rename', {
                url: "/rename",
                templateUrl: "views/images.edit.rename.html"
            });

            state = state.state('images.edit.delete', {
                url: "/delete",
                templateUrl: "views/images.edit.delete.html"
            });
        });
    })(EMD.Editor || (EMD.Editor = {}));
    var Editor = EMD.Editor;
})(EMD || (EMD = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    ///<reference path="../../def/angular.d.ts" />
    ///<reference path="../Config.ts" />
    (function (Editor) {
        (function (DirectiveRestriction) {
            DirectiveRestriction[DirectiveRestriction["any"] = 0] = "any";
            DirectiveRestriction[DirectiveRestriction["elements"] = 1] = "elements";
            DirectiveRestriction[DirectiveRestriction["attributes"] = 2] = "attributes";
            DirectiveRestriction[DirectiveRestriction["classes"] = 3] = "classes";
            DirectiveRestriction[DirectiveRestriction["comments"] = 4] = "comments";
        })(Editor.DirectiveRestriction || (Editor.DirectiveRestriction = {}));
        var DirectiveRestriction = Editor.DirectiveRestriction;

        /**
        * A class which allows creating new elements or attributes
        */
        var Directive = (function () {
            /**
            * Constructor
            */
            function Directive() {
                var _this = this;
                this.restrict = 'E';
                var setupCallback = function (s, e, t) {
                    return _this.setup(s, e, t);
                };
                var linkCallback = function (s, e, a) {
                    return _this.linkElement(s, e, a);
                };

                this.controller = function ($scope, $element, $transclude) {
                    setupCallback($scope, $element, $transclude);
                };

                this.link = function ($scope, $element, $attributes) {
                    linkCallback($scope, $element, $attributes);
                };
            }
            Object.defineProperty(Directive.prototype, "restriction", {
                set: /**
                * Set where the directive can be used
                * @param value
                */
                function (value) {
                    switch (value) {
                        case DirectiveRestriction.any:
                            this.restrict = 'EACM';
                            break;
                        case DirectiveRestriction.attributes:
                            this.restrict = 'A';
                            break;
                        case DirectiveRestriction.classes:
                            this.restrict = 'C';
                            break;
                        case DirectiveRestriction.elements:
                            this.restrict = 'E';
                            break;
                        case DirectiveRestriction.comments:
                            this.restrict = 'M';
                            break;
                    }
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Do any setup needed on the element.  Equivalent to the controller property for angular
            */
            Directive.prototype.setup = function ($scope, $element, $transclude) {
            };

            /**
            * Link the element and perform any event registrations.  Equivalent to the link property for angular
            */
            Directive.prototype.linkElement = function ($scope, $element, $attributes) {
            };

            Directive.register = /**
            * Register a directive to be used by the system
            * @param name the name of the directive
            * @param factory a function that creates the directive
            */
            function (name, factory) {
                EMD.Editor.emdEditorModule.directive(name, factory);
            };
            return Directive;
        })();
        Editor.Directive = Directive;

        /**
        * A directive where the contents are replaced by a template
        */
        var ReplaceDirective = (function (_super) {
            __extends(ReplaceDirective, _super);
            /**
            * Constructor
            */
            function ReplaceDirective() {
                _super.call(this);
                this.replace = true;
                this.template = this.getTemplate();
                this.transclude = true;
            }
            /**
            * Get the template used in the replacement
            * @returns {string} the template as a string
            */
            ReplaceDirective.prototype.getTemplate = function () {
                return "";
            };
            return ReplaceDirective;
        })(Directive);
        Editor.ReplaceDirective = ReplaceDirective;
    })(EmbeddedMarkdown.Editor || (EmbeddedMarkdown.Editor = {}));
    var Editor = EmbeddedMarkdown.Editor;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    ///<reference path="Directive.ts" />
    (function (Editor) {
        /**
        * The drop zone directive that allows files to be dropped onto an element.
        * Use:
        * <div zdropzone ondrop='functionToCall(files)'>
        *   <other-stuff />
        * </div>
        */
        var DropZone = (function (_super) {
            __extends(DropZone, _super);
            function DropZone($parse) {
                _super.call(this);
                this.$parse = $parse;

                this.restriction = Editor.DirectiveRestriction.attributes;
            }
            DropZone.prototype.linkElement = function ($scope, $element, $attributes) {
                // create a function from the "onfiledrop" attribute
                var onDropFunction = this.$parse($attributes.onfiledrop);

                new DropZoneElement($element, function (data) {
                    return onDropFunction($scope, data);
                });
            };
            return DropZone;
        })(Editor.Directive);

        /**
        * Handles all the drop-zone logic
        */
        var DropZoneElement = (function () {
            function DropZoneElement($element, scopeOnDrop) {
                var _this = this;
                this.$element = $element;
                this.scopeOnDrop = scopeOnDrop;
                $element.on("dragover", false);
                $element.on("dragenter", false);

                // on drop, call the ondrop method with the files
                $element.on('drop', function (evt) {
                    return _this.onDrop(evt);
                });
            }
            /**
            * Called when we drop files onto the drop zone
            * @param evt the event that occurred
            */
            DropZoneElement.prototype.onDrop = function (evt) {
                // jquery event
                evt.stopPropagation();
                evt.preventDefault();

                // convert it to the natural event
                var mouseEvt = ((evt).originalEvent);

                if (mouseEvt.dataTransfer != null && mouseEvt.dataTransfer.files != null && mouseEvt.dataTransfer.files.length > 0) {
                    var files = mouseEvt.dataTransfer.files;
                    this.scopeOnDrop({ files: files });
                }
            };
            return DropZoneElement;
        })();

        Editor.Directive.register("zdropzone", function ($parse) {
            return new DropZone($parse);
        });

        /*
        Have dragdrop for the entire app setup (this allows file drops to not
        cause the UI to change
        */
        $(function () {
            var dropZone = document.getElementsByTagName("body")[0];
            dropZone.addEventListener('dragover', function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
            }, false);
            dropZone.addEventListener('drop', function (evt) {
                //evt.stopPropagation();
                //evt.preventDefault();
                console.log(evt.target);
            }, false);
        });
    })(EmbeddedMarkdown.Editor || (EmbeddedMarkdown.Editor = {}));
    var Editor = EmbeddedMarkdown.Editor;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
///<reference path="../../def/jquery.d.ts" />
/**
* Utility classes
*/
var Utils;
(function (Utils) {
    /**
    * Maintains focus for an element and its children
    */
    var FocusManager = (function () {
        function FocusManager($element, $scope) {
            var _this = this;
            this.$element = $element;
            this.$scope = $scope;
            $scope.$on(FocusManager.focusEvent, function (e, originator) {
                if (originator == _this)
                    return;

                e.stopPropagation();
                setTimeout(function () {
                    return _this.onFocusReturn(e);
                }, 10);
            });

            //$element.on(FocusManager.focusEvent, e => this.onFocusReturn(e));
            $element.on('$destroy', function () {
                return _this.onDestroy();
            });
            $element.on('keydown', function (e) {
                return _this.onKeyDown(e);
            });
            $element.on('click', function (e) {
                _this.onFocusReturn(e);
                return false;
            });

            $element.attr('wantfocus', true);

            $element.focusin(function (e) {
                return _this.onFocusIn(e);
            });
            $element.focusout(function (e) {
                return _this.onFocusOut(e);
            });

            setTimeout(function () {
                return _this.onInitialFocus();
            }, 0);
        }
        /**
        * Called when we initially get focus
        */
        FocusManager.prototype.onInitialFocus = function () {
            this.$element.find('[autofocus]').focus();
        };

        /**
        * Called when the scope is about to be destroyed
        */
        FocusManager.prototype.onDestroy = function () {
            this.$scope.$emit(FocusManager.focusEvent, this);
            //this.$element.parent().trigger(FocusManager.focusEvent);
        };

        /**
        * Called when we regain focus from a child
        */
        FocusManager.prototype.onFocusReturn = function (e) {
            if (this.$element.has(this.lastFocused).length > 0) {
                $(this.lastFocused).focus();
            } else {
                this.onInitialFocus();
            }
        };

        /**
        * Called when we focus on a child element
        */
        FocusManager.prototype.onFocusIn = function (e) {
            var rootParent = $(e.target).closest("ui-view");

            if (this.$element.has(rootParent).length > 0)
                return;

            this.lastFocused = e.target;
            e.preventDefault();
            e.stopPropagation();
        };

        FocusManager.prototype.onFocusOut = function (e) {
            e.preventDefault();
            e.stopPropagation();
        };

        /**
        * Called whenever we press a key and the element has focus
        * @param e
        */
        FocusManager.prototype.onKeyDown = function (e) {
            switch (e.keyCode) {
                case 9:
                    this.onTab(e);
                    break;
                case 13:
                    this.onEnter(e);
                    break;
                case 27:
                    this.onEscape(e);
                    break;
            }
        };

        /**
        * Called when the escape key has been pressed
        * @param e
        */
        FocusManager.prototype.onEscape = function (e) {
            this.click(this.$element.find('.close'));
            e.preventDefault();
            e.stopPropagation();
        };

        /**
        * Click an element (mimic left-click)
        */
        FocusManager.prototype.click = function (element) {
            var event = jQuery.Event("click");
            event.which = 1;
            element.trigger(event);
        };

        /**
        * Called when the enter key has been pressed
        */
        FocusManager.prototype.onEnter = function (e) {
            var focused = this.$element.find('[tabindex]:focus,:focus');

            if (focused.length > 0 && !focused.is("input")) {
                this.click(focused);
                console.log('clicked:');
                console.log(focused[0]);
            } else {
                this.$element.find('.btn-primary').click();
            }

            e.preventDefault();
            e.stopPropagation();
        };

        /**
        * Called when the tab key was pressed
        */
        FocusManager.prototype.onTab = function (e) {
            var focusable = this.$element.find(':input:enabled:visible,[tabindex]').not('.nofocus');

            var currentIndex = jQuery.makeArray(focusable).indexOf(document.activeElement);
            var increment = e.shiftKey ? -1 : 1;
            var nextIndex = currentIndex + increment;

            if (nextIndex < 0) {
                nextIndex = focusable.length - 1;
            } else if (nextIndex >= focusable.length) {
                nextIndex = 0;
            }

            $(focusable[nextIndex]).focus();

            e.preventDefault();
            e.stopPropagation();
        };
        FocusManager.focusEvent = 'panel.return';
        return FocusManager;
    })();
    Utils.FocusManager = FocusManager;
})(Utils || (Utils = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    ///<reference path="Directive.ts" />
    ///<reference path="../utils/FocusManager.ts" />
    (function (Editor) {
        /**
        * An element whose elements are converted to multiple divs
        */
        var Panel = (function (_super) {
            __extends(Panel, _super);
            function Panel($timeout) {
                _super.call(this);
                this.$timeout = $timeout;
            }
            Panel.prototype.getTemplate = function () {
                return '' + '<div class="panel-view">' + '<div class="panel-container">' + '<div class="panel">' + '<div class="content-container" ng-transclude></div>' + '</div>' + '</div>' + '</div>';
            };

            Panel.prototype.linkElement = function ($scope, $element, $attributes) {
                new Utils.FocusManager($element, $scope);
            };
            return Panel;
        })(Editor.ReplaceDirective);

        EMD.Editor.emdEditorModule.directive("xpanel", function ($timeout) {
            return new Panel($timeout);
        });
    })(EmbeddedMarkdown.Editor || (EmbeddedMarkdown.Editor = {}));
    var Editor = EmbeddedMarkdown.Editor;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    ///<reference path="Directive.ts" />
    (function (Editor) {
        /**
        * An element whose elements are converted to multiple divs and allows a
        * class to be assigned as well.
        *
        * Usage:
        *   <xpart as="body">
        *     <b>Text and stuff</b>
        *   </xpart>
        *
        * Will be converted to:
        *  <div class="body">
        *    <div class='container'>
        *      <div class='content'></div>
        *    </div>"
        *  </div>";
        */
        var PartDirective = (function (_super) {
            __extends(PartDirective, _super);
            function PartDirective() {
                _super.apply(this, arguments);
                this.priority = 100;
            }
            PartDirective.prototype.getTemplate = function () {
                return '' + "<div>" + "<div class='content-container'><div class='content' ng-transclude></div></div>" + "</div>";
            };

            PartDirective.prototype.setup = function ($scope, $element, $transclude) {
                //$element.find('.container > .content').append($transclude());
            };

            PartDirective.prototype.linkElement = function ($scope, $element, $attributes) {
                if ($attributes.as != null) {
                    $element.addClass($attributes.as);
                }
            };
            return PartDirective;
        })(Editor.ReplaceDirective);

        Editor.Directive.register("xpart", function () {
            return new PartDirective();
        });
    })(EmbeddedMarkdown.Editor || (EmbeddedMarkdown.Editor = {}));
    var Editor = EmbeddedMarkdown.Editor;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    ///<reference path="Directive.ts" />
    (function (Editor) {
        var Button = (function (_super) {
            __extends(Button, _super);
            function Button(definition) {
                _super.call(this);
                this.definition = definition;
                this.restriction = Editor.DirectiveRestriction.attributes;
            }
            Button.prototype.linkElement = function ($scope, $element, $attributes) {
                var _this = this;
                if (!$attributes.uiSref) {
                    $element.click(function (e) {
                        return _this.handleClick(e, $scope);
                    });
                }

                if (this.definition.classes != null) {
                    this.definition.classes.forEach(function (c) {
                        return $element.addClass(c);
                    });
                }

                this.register($element);

                if ($attributes.text != null) {
                    $element.text($attributes.text);
                } else if (this.definition.html != null) {
                    $element.html(this.definition.html);
                } else if (this.definition.text != null) {
                    $element.text(this.definition.text);
                }

                function capitaliseFirstLetter(str) {
                    return str.charAt(0).toUpperCase() + str.slice(1);
                }

                this.definition.click = capitaliseFirstLetter(this.definition.click);
            };

            Button.prototype.register = function ($element) {
            };

            Button.prototype.handleClick = function (e, $scope) {
                var _this = this;
                $scope.$apply(function () {
                    $scope.handleButtonAction('on' + _this.definition.click);
                });

                e.preventDefault();
                e.stopPropagation();
            };
            return Button;
        })(Editor.Directive);

        function register(name, definition) {
            Editor.Directive.register(name, function () {
                return new Button(definition);
            });
        }

        register('xclose', {
            html: "&times",
            click: "cancel",
            classes: ['close', 'nofocus']
        });

        register('xcancel', {
            text: "Cancel",
            click: "cancel",
            classes: ['btn']
        });

        register('xokay', {
            text: "Okay",
            click: "okay",
            classes: ['btn', 'btn-primary']
        });

        register('xsave', {
            text: "Save",
            click: "save",
            classes: ['btn', 'btn-primary']
        });
    })(EmbeddedMarkdown.Editor || (EmbeddedMarkdown.Editor = {}));
    var Editor = EmbeddedMarkdown.Editor;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    ///<reference path="Directive.ts" />
    (function (Editor) {
        var Icon = (function (_super) {
            __extends(Icon, _super);
            function Icon($parse) {
                _super.call(this);
                this.$parse = $parse;

                this.transclude = "element";
            }
            Icon.prototype.linkElement = function ($scope, $element, $attributes) {
                $element.addClass('xicon-' + $attributes.name);
                $element.attr('title', $attributes.text);
                $element.attr('name', null);
                $element.attr('text', null);

                var clickFunction = this.$parse($attributes.click);
            };

            Icon.prototype.getTemplate = function () {
                return "<span></span>";
            };
            return Icon;
        })(Editor.ReplaceDirective);

        Editor.Directive.register('xicon', function ($parse) {
            return new Icon($parse);
        });
    })(EmbeddedMarkdown.Editor || (EmbeddedMarkdown.Editor = {}));
    var Editor = EmbeddedMarkdown.Editor;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    ///<reference path="Directive.ts" />
    ///<reference path="../Utils/FocusManager.ts" />
    (function (Editor) {
        /**
        * An element whose elements are converted to multiple divs
        */
        var Dialog = (function (_super) {
            __extends(Dialog, _super);
            function Dialog($timeout) {
                _super.call(this);
                this.$timeout = $timeout;
            }
            Dialog.prototype.getTemplate = function () {
                return '' + '<div class="dialog-view">' + '<div class="dialog" ng-transclude>' + '</div>' + '</div>';
            };

            Dialog.prototype.setup = function ($scope, $element, $transclude) {
                //$element.find('.panel > .container').append($transclude().children());
            };

            Dialog.prototype.linkElement = function ($scope, $element, $attributes) {
                new Utils.FocusManager($element, $scope);

                if ($attributes.size) {
                    $element.find('.dialog').addClass($attributes.size);
                }
            };
            return Dialog;
        })(Editor.ReplaceDirective);

        EMD.Editor.emdEditorModule.directive("xdialog", function ($timeout) {
            return new Dialog($timeout);
        });
    })(EmbeddedMarkdown.Editor || (EmbeddedMarkdown.Editor = {}));
    var Editor = EmbeddedMarkdown.Editor;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
/**
* Embedded Markdown Document interface
*/
var EMD;
(function (EMD) {
    /**
    * Loads a document from an element
    */
    var Serializer = (function () {
        function Serializer() {
        }
        Serializer.prototype.load = function (element) {
            this.doc = new EMD.Document();

            var get = function (selector) {
                return (element.querySelector(selector));
            };

            this.doc.version = element.getAttribute("data-emd-version");

            this.loadMetadata(get("#-emd-meta"));
            this.loadMarkdown(get("#-emd-content").children[0]);
            this.loadRendered(get("#-emd-rendered-body"));
            this.loadImages(get("#-emd-images"));

            return this.doc;
        };

        Serializer.prototype.save = function (doc) {
            this.doc = doc;

            var html = this.createCoreStructure();
            html.setAttribute('data-emd-version', Serializer.version);

            var get = function (selector) {
                return (html.querySelector(selector));
            };

            this.saveMetadata(get("#-emd-meta"));
            this.saveMarkdown(get("#-emd-content").children[0]);
            this.saveRendered(get("#-emd-rendered-body"));
            this.saveImages(get("#-emd-images"));

            return html;
        };

        /**
        * Create the core part of the tree
        * @returns {HTMLElement} the html element containing all of the elements for the document
        */
        Serializer.prototype.createCoreStructure = function () {
            var html = document.createElement('html');

            var head = document.createElement('head');
            head.innerHTML = '<head>' + '<meta charset="utf-8">' + '<title></title>' + '<script type="application/json" id="-emd-meta">{}</script>';

            var body = document.createElement("body");
            body.innerHTML = '' + '<div id="-emd-rendered">' + ' <div id="-emd-rendered-body"></div>' + '</div>' + '<div id="-emd-document" style="display: none">' + '  <div id="-emd-content">' + '    <script type="text/x-emd-markdown" data-emd-name="body"></script>' + '  </div>' + '  <div id="-emd-images"></div>' + '  <div id="-emd-extra"></div>' + '</div>';

            html.appendChild(head);
            html.appendChild(body);

            return html;
        };

        /**
        * Load the metadata for the document
        * @param doc the document into which the metaadata should be placed
        * @param metaDataElement the element that contains the key-value pairs
        */
        Serializer.prototype.loadMetadata = function (metaDataElement) {
            var element = document.createElement("div");

            // transfer it over so that the xml is "parsed"
            element.innerHTML = metaDataElement.innerHTML;

            var dictionary = {};
            var children = element.children;

            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                dictionary[child.getAttribute("name").toLowerCase()] = child.getAttribute("value");
            }

            this.doc.properties = dictionary;
        };

        Serializer.prototype.saveMetadata = function (metaDataElement) {
            var properties = this.doc.properties;
            if (properties == null) {
                properties = {};
            }

            for (var key in properties) {
                if (!properties.hasOwnProperty(key))
                    continue;

                var value = properties[key];
                var meta = document.createElement("meta");

                // set the key and value
                meta.setAttribute('name', key);
                meta.setAttribute('value', value);

                metaDataElement.appendChild(meta);
            }
        };

        /**
        * Load the rendered html
        * @param doc the document into which to load the rendered html
        * @param contentElement the element that contains the element
        */
        Serializer.prototype.loadRendered = function (contentElement) {
            this.doc.rendered = {
                body: contentElement.innerHTML
            };
        };

        Serializer.prototype.saveRendered = function (contentElement) {
            contentElement.innerHTML = this.doc.rendered.body;
        };

        /**
        * Read the markdown from the element
        * @param doc the document into which to load the markdown
        * @param contentElement the element that contains the markdown
        */
        Serializer.prototype.loadMarkdown = function (contentElement) {
            var mdBody = Base64.decode(contentElement.textContent.trim());
            this.doc.markdown = {
                body: mdBody
            };
        };

        /**
        * Save the markdown into the element
        * @param contentElement the element into which to save the markdown
        */
        Serializer.prototype.saveMarkdown = function (contentElement) {
            contentElement.textContent = Base64.encode(this.doc.markdown.body);
        };

        /**
        * Load all of the images
        * @param imagesElement the element that contains the image elements
        */
        Serializer.prototype.loadImages = function (imagesElement) {
            this.doc.images = [];

            var elements = imagesElement.querySelectorAll("img");

            for (var i = 0; i < elements.length; i++) {
                var image = elements[i];
                this.doc.images.push({
                    name: image.getAttribute("data-emd-name"),
                    data: image.getAttribute("src")
                });
            }
        };

        /**
        * Save all of the images
        * @param imagesElement the element into which to save the images
        */
        Serializer.prototype.saveImages = function (imagesElement) {
            var images = this.doc.images;

            if (images == null) {
                images = [];
            }

            for (var i = 0; i < images.length; i++) {
                var image = images[i];

                var imageElement = document.createElement('img');
                imageElement.setAttribute('src', image.data);
                imageElement.setAttribute('data-emd-name', image.name);
                imageElement.setAttribute('alt', '');

                imagesElement.appendChild(imageElement);
            }
        };
        Serializer.version = '0.1';
        return Serializer;
    })();

    /**
    * Load a EMD document from an iframe
    * @param element the iframe that contains the doc-markdown
    * @returns {EMD.Document}
    */
    function load(element) {
        var serializer = new Serializer();
        return serializer.load(element);
    }
    EMD.load = load;

    /**
    * Saves a EMD document to an element
    * @param document the document to save
    * @returns {HTMLElement} the element to which the EMD.Document elements was saved
    */
    function save(document) {
        var serializer = new Serializer();
        return serializer.save(document);
    }
    EMD.save = save;

    /**
    * Image data for a single image
    */
    var Image = (function () {
        /**
        * Create a new image
        * @param name the name of the image
        * @param imageData the data associated with the image
        */
        function Image(name, data) {
            this.name = name;
            this.data = data;
        }
        return Image;
    })();
    EMD.Image = Image;

    /**
    * A doc-markdown document class containing all of the elements for the document
    */
    var Document = (function () {
        function Document() {
        }
        /**
        * Remove an image from the list
        * @param image the image to remove
        */
        Document.prototype.removeImage = function (image) {
            if (this.images == null)
                return;

            for (var i = 0; i < this.images.length; i++) {
                if (this.images[i] == image) {
                    this.images.splice(i);
                    return;
                }
            }
        };

        /**
        * Add an image to the list
        * @param image the image to add to the list
        */
        Document.prototype.addImage = function (image) {
            if (this.images == null)
                this.images = [];

            this.images.push(image);
        };

        /**
        * Check if the document contains an image with the specified name
        * @param name the name to check if it already exists on an image
        */
        Document.prototype.containsImageWithName = function (name) {
            if (this.images == null)
                return false;

            for (var i = 0; i < this.images.length; i++) {
                var image = this.images[i];
                if (image.name == name)
                    return true;
            }

            return false;
        };

        /**
        * Get the image associated withe the name
        * @param name the name of the image to retrieve
        */
        Document.prototype.getImage = function (name) {
            for (var i = 0; i < this.images.length; i++) {
                var image = this.images[i];
                if (image.name == name) {
                    return image;
                }
            }

            return null;
        };
        return Document;
    })();
    EMD.Document = Document;
})(EMD || (EMD = {}));

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
var Base64 = {
    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    // public method for encoding
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }

        return output;
    },
    // public method for decoding
    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }

        output = Base64._utf8_decode(output);

        return output;
    },
    // private method for UTF-8 encoding
    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }

        return utftext;
    },
    // private method for UTF-8 decoding
    _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = 0;
        var c1 = 0;
        var c2 = 0;
        var c3 = 0;

        while (i < utftext.length) {
            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }

        return string;
    }
};
var EMD;
(function (EMD) {
    (function (Editor) {
        /**
        * Converts from markdown into html
        */
        var MarkdownConverter = (function () {
            /**
            * Default constructor
            */
            function MarkdownConverter() {
                this.markdownDeep = new MarkdownDeep.Markdown();
                this.markdownDeep.ExtraMode = true;
                this.markdownDeep.SafeMode = false;
            }
            /**
            * Convert markdown to html
            * @param string the markdown to convert
            * @returns {*}
            */
            MarkdownConverter.prototype.convert = function (markdown) {
                return this.markdownDeep.Transform(markdown);
            };
            return MarkdownConverter;
        })();
        Editor.MarkdownConverter = MarkdownConverter;
    })(EMD.Editor || (EMD.Editor = {}));
    var Editor = EMD.Editor;
})(EMD || (EMD = {}));
/**
* Utility classes
*/
var Utils;
(function (Utils) {
    /**
    * Allows being alerted at various intervals
    */
    var Timer = (function () {
        /**
        * Construct a new timeout object
        * @param timeout how long after reset() is called that the callback should be invoked
        * @param callback the function to invoke when the timer elapses
        */
        function Timer(timeout, callback) {
            this.timeout = timeout;
            this.callback = callback;
        }
        /**
        * Start the timer and have it invoke the callback when the timeout occurs
        */
        Timer.prototype.reset = function () {
            // clear the old timeout
            clearTimeout(this.timeoutId);

            // set the new timeout
            this.timeoutId = setTimeout(this.callback, this.timeout);
        };
        return Timer;
    })();
    Utils.Timer = Timer;
})(Utils || (Utils = {}));
var EMD;
(function (EMD) {
    ///<reference path="../def/jquery.d.ts" />
    ///<reference path="../def/angular.d.ts" />
    ///<reference path="../def/ace.d.ts" />
    ///<reference path="MarkdownConverter.ts" />
    ///<reference path="utils/Timer.ts" />
    ///<reference path="DocumentsService.ts" />
    (function (Editor) {
        var element = document.querySelector(".md-editor .editor");

        (function (EditorMode) {
            EditorMode[EditorMode["EditorAndPreview"] = 0] = "EditorAndPreview";
            EditorMode[EditorMode["EditorOnly"] = 1] = "EditorOnly";
            EditorMode[EditorMode["Images"] = 2] = "Images";
        })(Editor.EditorMode || (Editor.EditorMode = {}));
        var EditorMode = Editor.EditorMode;

        /**
        * The markdown editor class which controls the editor and the renderer
        */
        var MarkdownEditor = (function () {
            /**
            * Create a new editor
            * @param session the session of the ace editor
            * @param editorElement the jquery element which contains the ace editor
            * @param renderElement the jquery element into which the rendered html should be placed
            */
            function MarkdownEditor(session, instanceElement, documents) {
                var _this = this;
                this.session = session;
                this.instanceElement = instanceElement;
                this.documents = documents;
                this.editorElement = instanceElement.find(".markdownEditor");
                this.renderElement = instanceElement.find(".preview iframe").contents().find('html');

                this.markdownConvertor = new Editor.MarkdownConverter();

                this.session.setMode("ace/mode/markdown");
                this.session.setUseWrapMode(true);
                this.session.setWrapLimitRange(null, null);

                this.timer = new Utils.Timer(1000, function () {
                    return _this.refreshRendered();
                });

                this.session.on('change', function () {
                    _this.timer.reset();
                });

                this.timer.reset();
            }
            /**
            * Refresh the rendered markdown
            */
            MarkdownEditor.prototype.refreshRendered = function () {
                var transformed = this.markdownConvertor.convert(this.session.getValue());

                var style = "<style type='text/css'>" + $("#style-github").text() + "</style>";

                this.renderElement.html(transformed);
                this.renderElement.find('body').append(style);
                var _this = this;
                this.renderElement.find('img').each(function () {
                    var src = $(this).attr('src');
                    this.src = _this.documents.current.getSourceForImage(src);
                });
            };
            return MarkdownEditor;
        })();
        Editor.MarkdownEditor = MarkdownEditor;
    })(EMD.Editor || (EMD.Editor = {}));
    var Editor = EMD.Editor;
})(EMD || (EMD = {}));
var Utils;
(function (Utils) {
    var DragDropHelper = (function () {
        /**
        * Create a new drag drop helper
        * @param element the element that items can be dropped onto
        */
        function DragDropHelper(element, action, overClass) {
            if (typeof overClass === "undefined") { overClass = 'drag'; }
            var _this = this;
            this.element = element;
            this.action = action;
            this.overClass = overClass;
            var self = $(element);
            var collection = [];

            self.on('dragenter', function (event) {
                if (collection.length === 0) {
                    _this.handleHoverStart(event);
                }
                collection.push(event.target);
            });

            self.on('dragleave', function (event) {
                setTimeout(function () {
                    collection = collection.filter(function (e) {
                        return e != event.target;
                    });
                    if (collection.length === 0) {
                        _this.handleHoverEnd(event);
                    }
                }, 1);
            });

            self.on('drop', function (event) {
                collection.length = 0;
            });

            element.addEventListener('dragover', function (evt) {
                return _this.handleHoverOver(evt);
            }, false);
            element.addEventListener('drop', function (evt) {
                return _this.handleDrop(evt);
            }, false);
        }
        DragDropHelper.prototype.handleHoverOver = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            evt.dataTransfer.dropEffect = 'copy';
        };

        DragDropHelper.prototype.handleHoverStart = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();

            this.element.classList.add(this.overClass);
        };

        DragDropHelper.prototype.handleHoverEnd = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();

            this.element.classList.remove(this.overClass);
        };

        DragDropHelper.prototype.handleDrop = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();

            this.action(evt);
            this.handleHoverEnd(evt);
        };
        return DragDropHelper;
    })();
    Utils.DragDropHelper = DragDropHelper;
})(Utils || (Utils = {}));
var EMD;
(function (EMD) {
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
    (function (Editor) {
        /**
        *  The main angular controller
        */
        var AppController = (function () {
            /**
            * Default constructor
            * @param $scope the Angular Scope
            */
            function AppController($rootScope, $scope, $state, editors, editApp) {
                this.editApp = editApp;
                $scope.controller = this;

                this.scope = $scope;
                this.fileSystem = Application.Files.FileSystems.get("LocalStorage");

                var aceEditor = editors.markdownEditor;
                var editor = new EMD.Editor.MarkdownEditor(aceEditor.getSession(), $('#app'), editApp.documents);
                this.editor = aceEditor;
                this.editor.setFontSize("1.1em");
                this.editor.renderer.setShowGutter(false);

                this.markdownEditor = editor;

                $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams) {
                    $scope.showPanel = !$state.includes('edit');
                });

                var lastFile = this.fileSystem.getRootDirectory().getFile("session");
                this.loadSession();
                //new DragDropHelper(document.body, (evt) => this.handleDrop(evt));
            }
            AppController.prototype.saveSession = function () {
                var doc = this.editApp.documents.current.document;

                // add the content/rendered
                doc.parts.set('body', this.markdownEditor.session.getValue());
                doc.renderedHtml = this.markdownEditor.renderElement.html();

                var text = EmbeddedMarkdown.toString(doc);

                this.fileSystem.getRootDirectory().getFile("session").save(text);
            };

            AppController.prototype.loadSession = function () {
                var file = this.fileSystem.getRootDirectory().getFile("session");

                if (file == null || !file.exists()) {
                    this.editApp.documents.current = new EmbeddedMarkdown.Editor.DocumentWrapper(new EmbeddedMarkdown.EmdDocument());
                } else {
                    this.editApp.documents.load(file);
                    this.editor.session.setValue(this.editApp.documents.current.document.parts.get('body'));
                }
            };

            /**
            * Download the file
            */
            AppController.prototype.downloadFile = function () {
                //      var doc = new EMD.Document();
                //      var html = this.markdownEditor.save(doc);
                //
                //      var href = "data:text/html," + html.innerHTML;
                //
                //      this.scope.$broadcast('download', {
                //        downloadData: href
                //      })
            };

            /**
            * Perform an undo operation
            * @param doUndo true to undo, false to redo
            */
            AppController.prototype.doUndo = function (doUndo) {
                if (doUndo) {
                    this.editor.getSession().getUndoManager().undo();
                } else {
                    this.editor.getSession().getUndoManager().redo(false);
                }
            };
            return AppController;
        })();
        Editor.AppController = AppController;
    })(EMD.Editor || (EMD.Editor = {}));
    var Editor = EMD.Editor;
})(EMD || (EMD = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    ///<reference path="../Config.ts" />
    ///<reference path="../../def/angular.d.ts" />
    ///<reference path="../EditAppService.ts" />
    (function (Editor) {
        /**
        * Base class for controllers
        */
        var Controller = (function () {
            function Controller($scope, name) {
                if (typeof name === "undefined") { name = "controller"; }
                var _this = this;
                this.$scope = $scope;
                this.name = name;
                $scope[name] = this;

                $scope.handleButtonAction = function (name) {
                    _this.handleClick(name);
                };

                this.initialize(Editor.EditAppService.instance);
            }
            Controller.prototype.handleClick = function (name) {
                var action = this[name];

                if (action == null) {
                    throw new Error("No handler '" + name + "' found");
                } else {
                    action.apply(this);
                }
            };

            Controller.prototype.apply = function () {
                this.$scope.$apply();
            };

            /**
            * Go to the specified action
            * @param actionName the action to go to
            * @param data any data associated with the action
            */
            Controller.prototype.go = function (actionName, data) {
                if (typeof data === "undefined") { data = null; }
                this.app.actions.go(actionName, data);
            };

            Controller.prototype.initialize = function (editApp) {
                this.app = editApp;
            };
            return Controller;
        })();
        Editor.Controller = Controller;
    })(EmbeddedMarkdown.Editor || (EmbeddedMarkdown.Editor = {}));
    var Editor = EmbeddedMarkdown.Editor;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    ///<reference path="AppController.ts" />
    ///<reference path="../EmdDocument.ts" />
    ///<reference path="../../def/jquery.d.ts" />
    ///<reference path="../EditAppService.ts" />
    ///<reference path="zController.ts" />
    ///<reference path="../application/files/Path.ts" />
    ///<reference path="../application/files/FilePath.ts" />
    (function (Editor) {
        /**
        * Handles the images
        */
        var ImagesController = (function (_super) {
            __extends(ImagesController, _super);
            /**
            * Create a new menu controller
            * @param $scope the scope for which the controller is active
            */
            function ImagesController($scope, editApp) {
                _super.call(this, $scope);
                this.editApp = editApp;

                this.images = editApp.documents.current.images;
            }
            /**
            * Called when we click on an image
            * @param image the image that was clicked
            */
            ImagesController.prototype.handleImageClick = function (image) {
                this.editApp.actions.go("images.edit", { id: image.name });
            };

            ImagesController.prototype.handleFileSelect = function (files) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    if (file.type.indexOf('image/') !== 0)
                        continue;

                    this.addFile(file);
                }
            };

            ImagesController.prototype.editImage = function (image) {
                this.go("images.edit.rename", { id: image.name });
            };

            ImagesController.prototype.deleteImage = function (image) {
                this.go("images.edit.delete", { id: image.name });
            };

            /**
            * Add a file to the list of images (if it is an image)
            */
            ImagesController.prototype.addFile = function (file) {
                var _this = this;
                var filePath = Application.Files.Path.parseFilePath(decodeURI(file.name));

                if (!this.isValidFileType(filePath))
                    return;

                this.convertBlockToBase64(file, function (base64) {
                    _this.addFileWithName(filePath, base64);
                });
            };

            ImagesController.prototype.isValidFileType = function (filePath) {
                switch (filePath.extension.toLowerCase()) {
                    case "png":
                    case "jpeg":
                    case "jpg":
                    case "bmp":
                        return true;
                    default:
                        return false;
                }
            };

            /**
            * Add a file with a specific name
            * @param filename the name of the file to add
            * @param data the data associated with the file
            */
            ImagesController.prototype.addFileWithName = function (filePath, data) {
                var name = filePath.name;

                var images = this.editApp.documents.current.document.images;

                var i = 2;
                while (images.contains(filePath.toString())) {
                    filePath.name = name + " (" + i + ")";
                    i++;

                    if (i > 100000) {
                        return;
                    }
                }

                var fullData = "data:image/" + filePath.extension.toLowerCase() + ";base64," + data;
                var newImage = new EmbeddedMarkdown.Image(filePath.toString(), fullData);

                this.editApp.documents.current.document.images.add(newImage.name, newImage);

                this.apply();
            };

            ImagesController.prototype.onCancel = function () {
                this.go('edit');
            };

            /**
            * Convert a blob to a base64 string
            * @param blob the blob to convert
            * @param callback the callback that gets executed with the first argument
            * containing the converted base64 string
            */
            ImagesController.prototype.convertBlockToBase64 = function (blob, callback) {
                var reader = new FileReader();
                reader.onload = function () {
                    var dataUrl = reader.result;
                    var base64 = dataUrl.split(',')[1];
                    callback(base64);
                };
                reader.readAsDataURL(blob);
            };
            return ImagesController;
        })(Editor.Controller);
        Editor.ImagesController = ImagesController;
    })(EmbeddedMarkdown.Editor || (EmbeddedMarkdown.Editor = {}));
    var Editor = EmbeddedMarkdown.Editor;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
///<reference path="../../def/jquery.d.ts" />
var EMD;
(function (EMD) {
    (function (Editor) {
        /**
        * Controls the download UI
        */
        var DownloadController = (function () {
            function DownloadController($scope) {
                var _this = this;
                this.scope = $scope;

                $scope.$on('download', function (evt, data) {
                    return _this.handleDownload(data);
                });
                $scope.filename = "document";
                $scope.handleAfterDownload = function () {
                    return _this.handleAfterDownload();
                };

                $('#download-document').on('shown', function () {
                    $('#download-document input').focus();
                });
            }
            DownloadController.prototype.handleDownload = function (data) {
                this.scope.isHidden = false;
                $('#download-link').attr('href', data.downloadData);

                this.promptDownload(true);
            };

            DownloadController.prototype.handleAfterDownload = function () {
                this.promptDownload(false);
            };

            DownloadController.prototype.promptDownload = function (show) {
                var opt = show ? 'show' : 'hide';

                $('#download-document').modal(opt);
            };
            return DownloadController;
        })();
        Editor.DownloadController = DownloadController;
    })(EMD.Editor || (EMD.Editor = {}));
    var Editor = EMD.Editor;
})(EMD || (EMD = {}));
var EMD;
(function (EMD) {
    ///<reference path="AppController.ts" />
    ///<reference path="../MarkdownEditor.ts" />
    (function (Editor) {
        /**
        * Handles all menus for the app
        */
        var MenuController = (function () {
            /**
            * Create a new menu controller
            * @param $scope the scope for which the controller is active
            */
            function MenuController($scope, $state) {
                var _this = this;
                this.appController = ($scope.$parent).controller;
                this.scope = $scope;
                this.$state = $state;

                var menu = new Menu();
                var fileMenu = menu.addMenu("File");
                fileMenu.addChild("Download", function () {
                    return _this.download();
                });
                fileMenu.addChild("Save", function () {
                    return _this.save();
                });

                var editMenu = menu.addMenu("Edit");
                editMenu.addChild("Undo", function () {
                    return _this.undo(true);
                });
                editMenu.addChild("Redo", function () {
                    return _this.undo(false);
                });

                var documentMenu = menu.addMenu("Document");
                documentMenu.addChild("Images", function () {
                    return _this.goto("images");
                });

                $scope.menu = menu;
                $scope.focused = false;

                $scope.handleTopLevelClick = function () {
                    return _this.handleTopLevelClick();
                };

                $(document.body).click(function (evt) {
                    return _this.handleBodyClick(evt);
                });
            }
            MenuController.prototype.goto = function (actionName) {
                this.$state.transitionTo(actionName, {}, { location: true, inherit: true, relative: this.$state.$current });
            };

            MenuController.prototype.handleTopLevelClick = function () {
                this.scope.focused = !this.scope.focused;
            };

            MenuController.prototype.handleBodyClick = function (evt) {
                if (!$(evt.target).hasClass('top-level')) {
                    this.scope.focused = false;
                    this.scope.$apply();
                }
            };

            /**
            * Undo or redo
            * @param doUndo true to undo, false to redo
            */
            MenuController.prototype.undo = function (doUndo) {
                this.appController.doUndo(doUndo);
            };

            /**
            * Save the current document
            */
            MenuController.prototype.save = function () {
                this.appController.saveSession();
            };

            /**
            * Download the current document
            */
            MenuController.prototype.download = function () {
                this.appController.downloadFile();
            };
            return MenuController;
        })();
        Editor.MenuController = MenuController;

        /**
        * Represents a top-level menu item
        */
        var Menu = (function () {
            /**
            * Default constructor
            */
            function Menu() {
                this.items = [];
            }
            /**
            * Create a new top-level menu item
            * @param name the name of the top level item to add
            * @returns {EMD.Editor.MenuItem} the menu item that was created
            */
            Menu.prototype.addMenu = function (name) {
                var item = new MenuItem(name);
                this.items.push(item);
                return item;
            };
            return Menu;
        })();

        /**
        * A menu item that contains other child menu items
        */
        var MenuItem = (function () {
            /**
            * Create a new top-level menu item
            * @param name the name of the menu item
            */
            function MenuItem(name) {
                this.name = name;
                this.children = [];
            }
            /**
            * Add a new child item to the top-level menu
            * @param name the name of the menu item
            * @param callback the action to perform with the item is clicked
            */
            MenuItem.prototype.addChild = function (name, callback) {
                var item = {
                    text: name,
                    callback: callback
                };
                this.children.push(item);
                return item;
            };
            return MenuItem;
        })();
    })(EMD.Editor || (EMD.Editor = {}));
    var Editor = EMD.Editor;
})(EMD || (EMD = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    /// <reference path="zController.ts" />
    ///<reference path="../EmdDocument.ts"/>
    ///<reference path="../EditAppService.ts" />
    (function (Editor) {
        /**
        * Allows for editing of images
        */
        var ImageEditController = (function (_super) {
            __extends(ImageEditController, _super);
            /**
            * @param $scope the scope for the controller
            * @param $stateParams
            * @param editApp
            */
            function ImageEditController($scope) {
                _super.call(this, $scope);

                var images = this.app.documents.current.document.images;
                var imageId = this.app.state.id;

                this.image = images.get(imageId);

                if (this.image == null) {
                    this.onCancel();
                    return;
                }

                this.originalName = this.image.name;
                this.newName = this.image.name;
            }
            /**
            * Go back to the image document
            */
            ImageEditController.prototype.onCancel = function () {
                this.go("images");
            };

            /**
            * Save the changes made
            */
            ImageEditController.prototype.onOkay = function () {
                //      console.log("Saving edited image");
                //
                //      if (this.newName != this.image.name) {
                //        var images = this.app.documents.current.document.images;
                //        var data = this.image.data;
                //
                //        images.remove(this.image);
                //        images.add(this.newName, new EmbeddedMarkdown.Image(this.newName, data));
                //      }
                this.go('images');
            };

            ImageEditController.prototype.canSave = function () {
                return this.isNameUnique();
            };

            ImageEditController.prototype.isNameUnique = function () {
                var images = this.app.documents.current.document.images;
                var otherImage = images.get(this.newName);
                return otherImage == null || otherImage == this.image;
            };
            return ImageEditController;
        })(Editor.Controller);
        Editor.ImageEditController = ImageEditController;
    })(EmbeddedMarkdown.Editor || (EmbeddedMarkdown.Editor = {}));
    var Editor = EmbeddedMarkdown.Editor;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    /// <reference path="zController.ts" />
    ///<reference path="../EmdDocument.ts"/>
    ///<reference path="../EditAppService.ts" />
    (function (Editor) {
        /**
        * Allows for editing of images
        */
        var ImageRenameController = (function (_super) {
            __extends(ImageRenameController, _super);
            /**
            * @param $scope the scope for the controller
            * @param $stateParams
            * @param editApp
            */
            function ImageRenameController($scope) {
                _super.call(this, $scope);

                var images = this.app.documents.current.document.images;
                var imageId = this.app.state.id;

                this.image = images.get(imageId);

                if (this.image == null) {
                    this.onCancel();
                    return;
                }

                this.originalName = this.image.name;
                this.newName = this.image.name;
            }
            /**
            * Go back to the image document
            */
            ImageRenameController.prototype.onCancel = function () {
                this.go("images");
            };

            /**
            * Save the changes made
            */
            ImageRenameController.prototype.onSave = function () {
                console.log("Saving edited image");

                if (this.newName != this.image.name) {
                    var images = this.app.documents.current.document.images;
                    var data = this.image.data;

                    images.remove(this.image);
                    images.add(this.newName, new EmbeddedMarkdown.Image(this.newName, data));
                }

                this.go('images');
            };

            ImageRenameController.prototype.canSave = function () {
                return this.isNameUnique();
            };

            ImageRenameController.prototype.isNameUnique = function () {
                var images = this.app.documents.current.document.images;
                var otherImage = images.get(this.newName);
                return otherImage == null || otherImage == this.image;
            };
            return ImageRenameController;
        })(Editor.Controller);
        Editor.ImageRenameController = ImageRenameController;
    })(EmbeddedMarkdown.Editor || (EmbeddedMarkdown.Editor = {}));
    var Editor = EmbeddedMarkdown.Editor;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
var EmbeddedMarkdown;
(function (EmbeddedMarkdown) {
    /// <reference path="zController.ts" />
    ///<reference path="../EmdDocument.ts"/>
    ///<reference path="../EditAppService.ts" />
    (function (Editor) {
        /**
        * Allows for editing of images
        */
        var ImageDeleteController = (function (_super) {
            __extends(ImageDeleteController, _super);
            /**
            * @param $scope the scope for the controller
            * @param $stateParams
            * @param editApp
            */
            function ImageDeleteController($scope) {
                _super.call(this, $scope);

                var images = this.app.documents.current.document.images;
                var imageId = this.app.state.id;

                this.image = images.get(imageId);

                if (this.image == null) {
                    this.onCancel();
                    return;
                }
            }
            /**
            * Go back to the image document
            */
            ImageDeleteController.prototype.onCancel = function () {
                this.go("images.edit", { id: this.image.name });
            };

            /**
            * Delete the image
            */
            ImageDeleteController.prototype.onOkay = function () {
                var images = this.app.documents.current.document.images.remove(this.image);
                this.go('images');
            };
            return ImageDeleteController;
        })(Editor.Controller);
        Editor.ImageDeleteController = ImageDeleteController;
    })(EmbeddedMarkdown.Editor || (EmbeddedMarkdown.Editor = {}));
    var Editor = EmbeddedMarkdown.Editor;
})(EmbeddedMarkdown || (EmbeddedMarkdown = {}));
//# sourceMappingURL=App.js.map
