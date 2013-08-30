var Application;
(function (Application) {
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
                for (var key in fss) {
                    if (fss.hasOwnProperty(key)) {
                        list.push({
                            name: key,
                            system: fss[key]
                        });
                    }
                }

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
var EMD;
(function (EMD) {
    ///<reference path="application/files/LocalStorage.ts" />
    ///<reference path="../def/ace.d.ts" />
    ///<reference path="../def/angular.d.ts" />
    (function (Editor) {
        Editor.emdEditorModule = angular.module('EMD.Editor.App', ['ui.state']);

        Editor.emdEditorModule.factory('editors', function () {
            var EditorsService = {
                markdownEditor: $('#core-editor').data('editor')
            };

            return EditorsService;
        });

        Editor.emdEditorModule.factory('actions', function ($state) {
            var ActionsService = {
                go: function (actionName, toParams) {
                    if (typeof toParams === "undefined") { toParams = {}; }
                    $state.transitionTo(actionName, toParams, {
                        location: true,
                        inherit: true,
                        relative: $state.$current
                    });
                }
            };

            return ActionsService;
        });

        Editor.emdEditorModule.config(function ($stateProvider, $urlRouterProvider) {
            //
            // For any unmatched url, send to /
            $urlRouterProvider.otherwise("");

            //
            // Now set up the states
            var state = $stateProvider;

            state = state.state('edit', {
                url: '',
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
        });
    })(EMD.Editor || (EMD.Editor = {}));
    var Editor = EMD.Editor;
})(EMD || (EMD = {}));
var EMD;
(function (EMD) {
    ///<reference path="../../def/angular.d.ts" />
    ///<reference path="../../def/angular.d.ts" />
    ///<reference path="../Config.ts" />
    (function (Editor) {
        Editor.emdEditorModule.directive("dropzone", function ($parse) {
            var dropzone = {
                restrict: "A",
                /**
                * Link the element to its functionality
                * @param $scope the current scope of the element
                * @param $element the element that is being hooked up
                * @param $attributes the atttributes for the element
                */
                link: function ($scope, $element, $attributes) {
                    // create a function from the "onfiledrop" attribute
                    var ondrop = $parse($attributes.onfiledrop);

                    $element.on("dragover", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    });

                    $element.on("dragenter", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    });

                    // on drop, call the ondrop method with the files
                    $element.on('drop', function (evt) {
                        // jquery event
                        evt.stopPropagation();
                        evt.preventDefault();

                        // convert it to the natural event
                        evt = (evt.originalEvent);

                        if (evt.dataTransfer != null && evt.dataTransfer.files != null && evt.dataTransfer.files.length > 0) {
                            var files = evt.dataTransfer.files;
                            ondrop($scope, { files: files });
                        }
                    });
                }
            };

            return dropzone;
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
    })(EMD.Editor || (EMD.Editor = {}));
    var Editor = EMD.Editor;
})(EMD || (EMD = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var EMD;
(function (EMD) {
    ///<reference path="../../def/angular.d.ts" />
    ///<reference path="../../def/angular.d.ts" />
    ///<reference path="../Config.ts" />
    (function (Editor) {
        Editor.emdEditorModule.directive('panel', function () {
            return new PanelDirective();
        });
        Editor.emdEditorModule.directive('panelHeader', function () {
            return new PanelHeaderDirective();
        });
        Editor.emdEditorModule.directive('panelBody', function () {
            return new PanelBodyDirective();
        });
        Editor.emdEditorModule.directive('panelFooter', function () {
            return new PanelFooterDirective();
        });

        var PanelDirective = (function () {
            function PanelDirective() {
                this.restrict = 'A';
                this.transclude = true;
                this.template = '<div class="panel-view">' + '<div class="panel-container">' + '<div class="panel" ng-transclude></div>' + '</div>' + '</div>';
            }
            return PanelDirective;
        })();

        var ReplacementDirective = (function () {
            function ReplacementDirective(template) {
                this.template = template;
                this.require = '^appPanel';
                this.restrict = 'E';
                this.transclude = true;
                this.replace = true;
            }
            return ReplacementDirective;
        })();

        var PanelHeaderDirective = (function (_super) {
            __extends(PanelHeaderDirective, _super);
            function PanelHeaderDirective() {
                _super.call(this, "<div class='header'>" + "<div class='content' ng-transclude></div>" + "</div>");
            }
            return PanelHeaderDirective;
        })(ReplacementDirective);

        var PanelBodyDirective = (function (_super) {
            __extends(PanelBodyDirective, _super);
            function PanelBodyDirective() {
                _super.call(this, "<div class='body'>" + "<div class='content' ng-transclude></div>" + "</div>");
            }
            return PanelBodyDirective;
        })(ReplacementDirective);

        var PanelFooterDirective = (function (_super) {
            __extends(PanelFooterDirective, _super);
            function PanelFooterDirective() {
                _super.call(this, "<div class='footer'>" + "<div class='content' ng-transclude></div>" + "</div>");
            }
            return PanelFooterDirective;
        })(ReplacementDirective);
    })(EMD.Editor || (EMD.Editor = {}));
    var Editor = EMD.Editor;
})(EMD || (EMD = {}));
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
            this.loadMarkdown(get("#-emd-markdown-body"));
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
            this.saveMarkdown(get("#-emd-markdown-body"));
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
            head.innerHTML = '<head>' + '<title></title>' + '<script type="text/xml" id="-emd-meta"></script>' + '<style id="-emd-css-theme" data-emd-name="x-custom" data-emd-default="true"></style>' + '<style id="-emd-css-custom"></style>' + '<script id="-emd-script-default" data-emd-name="value"></script>' + '<script id="-emd-script-custom"></script>';

            var body = document.createElement("body");
            body.innerHTML = '' + '<div id="-emd-rendered">' + ' <div id="-emd-rendered-body"></div>' + '</div>' + '<div id="-emd-document" style="display: none">' + '  <div id="-emd-content">' + '  <script type="text/x-emd-markdown" id="-emd-markdown-body"></script>' + '</div>' + '<div id="-emd-images"></div>' + ' <div id="-emd-process-scripts">' + '   <script type="text/x-emd-process-script" data-emd-script-type="user" data-emd-name="default"></script>' + ' </div>' + '</div>';

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
        * @param comment a comment describing the image
        */
        function Image(name, data) {
            this.name = name;
            this.data = data;
        }
        return Image;
    })();
    EMD.Image = Image;

    /**
    * A collection of items that have a name and can be retrieved by their name
    */
    var NamedList = (function () {
        /**
        * Create a new named list
        * @param isCaseSensitive whether the names of the items are case sensitive
        */
        function NamedList(isCaseSensitive, items) {
            if (typeof isCaseSensitive === "undefined") { isCaseSensitive = false; }
            if (typeof items === "undefined") { items = []; }
            this.isCaseSensitive = isCaseSensitive;
            this.items = items;
            if (this.items == null) {
                this.items = [];
            }
            this.hash = {};
        }
        /**
        * Add a new item to the collection
        * @param item the item to add to the collection
        * @returns {*} the item that was added to the collection
        */
        NamedList.prototype.add = function (item) {
            if (this.contains(item.name)) {
                throw new Error("Collection already contains item with that name");
            }

            // add it to the item array and add it to the hash list
            this.items.push(item);
            this.hash[this.formatName(item.name)] = item;

            return item;
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
            var name = this.formatName(item.name);

            if (this.contains(name)) {
                for (var i = 0; i < this.items.length; i++) {
                    if (this.items[i] == item) {
                        // found it!
                        return this.removeAtIndex(i, name);
                    }
                }
            }

            return null;
        };

        /**
        * Remove an item by its name
        * @param name the name of the item to remove from the collection
        * @returns {*} the item that was removed, or null if the item did not exist
        * in the collection
        */
        NamedList.prototype.removeByName = function (name) {
            name = this.formatName(name);

            if (this.contains(name)) {
                for (var i = 0; i < this.items.length; i++) {
                    var item = this.items[i];
                    if (item.name == name) {
                        // found it!
                        return this.removeAtIndex(i, name);
                    }
                }
            }

            return null;
        };

        /**
        * Remove the designated item at the specified index
        * @param i the index at which to remove
        * @param name the name of the item in the hashmap to remove
        * @returns {*} the item that was removed
        */
        NamedList.prototype.removeAtIndex = function (i, name) {
            var item = this.items.splice(i)[0];
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
    EMD.NamedList = NamedList;

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
    ///<reference path="EmdDocument.ts"/>
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
            function MarkdownEditor(session, instanceElement) {
                var _this = this;
                this.session = session;
                this.instanceElement = instanceElement;
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
                    var dataImage = _this.document.getImage(src);

                    if (dataImage != null) {
                        console.log(dataImage.name);
                        this.src = dataImage.data;
                    }
                });
            };

            /**
            * Load the data from the document
            * @param doc
            */
            MarkdownEditor.prototype.load = function (doc) {
                this.document = doc;
                this.session.setValue(doc.markdown.body);
            };

            /**
            * Save the contents of the editor into the document
            * @param document the document in which to save the editor contents
            */
            MarkdownEditor.prototype.save = function (document) {
                document.markdown = {
                    body: this.session.getValue()
                };

                document.rendered = {
                    body: this.renderElement.html()
                };

                return EMD.save(document);
            };

            MarkdownEditor.prototype.setMode = function (mode) {
                this.instanceElement.removeClass();

                switch (mode) {
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
            function AppController($rootScope, $scope, $state, editors) {
                var _this = this;
                $scope.controller = this;

                this.scope = $scope;
                this.fileSystem = Application.Files.FileSystems.get("LocalStorage");

                var aceEditor = editors.markdownEditor;
                var editor = new EMD.Editor.MarkdownEditor(aceEditor.getSession(), $('#app'));
                this.editor = aceEditor;

                this.markdownEditor = editor;

                $scope.initialize = this.initialize;

                $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams) {
                    $scope.showPanel = !$state.includes('edit');
                });

                // On load, load up the session
                var anyWindow = window;
                anyWindow.addEventListener('load', function () {
                    var lastFile = _this.fileSystem.getRootDirectory().getFile("temp");
                    if (lastFile.exists()) {
                        _this.load();
                    } else {
                        var loader = $("#document-loader");
                        $("#document-loader").load(function () {
                            _this.initialize();
                        });

                        loader.attr('src', "dmd-example.html");
                    }
                }, false);
                //new DragDropHelper(document.body, (evt) => this.handleDrop(evt));
            }
            AppController.prototype.handleDrop = function (evt) {
                var _this = this;
                var file = evt.dataTransfer.files[0];

                var reader = new FileReader();

                reader.onloadend = function () {
                    _this.loadFromText(reader.result);
                };

                var text = reader.readAsText(file);
            };

            AppController.prototype.loadFromText = function (text) {
                var element = document.createElement("html");
                element.innerHTML = text;
                var doc = EMD.load(element);
                this.markdownEditor.load(doc);
            };

            /**
            * Initialize and load the document
            */
            AppController.prototype.initialize = function () {
                var rootElement = ($("#document-loader")[0]).contentDocument.querySelector("html");

                var loadedDoc = EMD.load(rootElement);
                this.loadDocument(loadedDoc);
            };

            AppController.prototype.loadDocument = function (loadedDoc) {
                this.scope.document = loadedDoc;
                this.document = loadedDoc;

                this.markdownEditor.load(loadedDoc);

                this.scope.$apply();
            };

            AppController.prototype.save = function () {
                var file = this.fileSystem.getRootDirectory().getFile("temp");
                var doc = new EMD.Document();
                var element = this.markdownEditor.save(doc);
                file.save(element.outerHTML);
            };

            AppController.prototype.load = function () {
                var lastFile = this.fileSystem.getRootDirectory().getFile("temp");
                var element = document.createElement("html");
                var fakeElement = document.createElement("html");
                element.appendChild(fakeElement);
                fakeElement.outerHTML = lastFile.load();
                var doc = EMD.load(element);
                this.loadDocument(doc);
            };

            /**
            * Download the file
            */
            AppController.prototype.downloadFile = function () {
                var doc = new EMD.Document();
                var html = this.markdownEditor.save(doc);

                var href = "data:text/html," + html.innerHTML;

                this.scope.$broadcast('download', {
                    downloadData: href
                });
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

            /**
            * Refresh all of the images
            */
            AppController.prototype.refreshImages = function () {
                this.scope.$apply();
            };
            return AppController;
        })();
        Editor.AppController = AppController;
    })(EMD.Editor || (EMD.Editor = {}));
    var Editor = EMD.Editor;
})(EMD || (EMD = {}));
var EMD;
(function (EMD) {
    ///<reference path="AppController.ts" />
    ///<reference path="../EmdDocument.ts" />
    ///<reference path="../../def/jquery.d.ts" />
    (function (Editor) {
        /**
        * Handles the images
        */
        var ImagesController = (function () {
            /**
            * Create a new menu controller
            * @param $scope the scope for which the controller is active
            */
            function ImagesController($scope, actions) {
                this.actions = actions;
                this.appController = ($scope.$parent).controller;

                $scope.imageController = this;
            }
            ImagesController.prototype.handleImageClick = function (image) {
                this.actions.go("images.edit", { id: image.name });
            };

            ImagesController.prototype.handleFileSelect = function (files) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    if (file.type.indexOf('image/') !== 0)
                        continue;

                    this.addFile(file);
                }
            };

            ImagesController.prototype.addFile = function (file) {
                var _this = this;
                this.convertBlockToBase64(file, function (base64) {
                    _this.addFileWithName(file, file.name, base64);
                });
            };

            ImagesController.prototype.addFileWithName = function (file, filename, data) {
                filename = decodeURI(filename);

                var indexOfPeriod = filename.lastIndexOf('.');
                if (indexOfPeriod == -1)
                    return;

                var extension = filename.substr(indexOfPeriod + 1).toLowerCase();
                var name = filename.substring(0, indexOfPeriod);

                switch (extension) {
                    case "png":
                    case "jpeg":
                    case "jpg":
                    case "bmp":
                        break;
                    default:
                        return;
                }

                var document = this.appController.document;

                var testName = name + "." + extension;

                var i = 2;
                while (document.containsImageWithName(testName)) {
                    testName = name + " (" + i + ")" + "." + extension;
                    i++;

                    if (i > 100000) {
                        return;
                    }
                }

                filename = testName;

                var newImage = new EMD.Image(filename, "data:image/" + extension + ";base64," + data);

                // refresh the image list
                document.addImage(newImage);
                this.appController.refreshImages();
            };

            /**
            * Invoked when the file the user would like to upload has changed
            */
            ImagesController.prototype.handleFileChanged = function (element) {
                var files = element.files;

                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    this.addFile(file);
                }
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
        })();
        Editor.ImagesController = ImagesController;
    })(EMD.Editor || (EMD.Editor = {}));
    var Editor = EMD.Editor;
})(EMD || (EMD = {}));
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

                var modeMenu = menu.addMenu("Mode");
                modeMenu.addChild("Editor & Preview", function () {
                    return _this.appController.markdownEditor.setMode(Editor.EditorMode.EditorAndPreview);
                });
                modeMenu.addChild("Editor Only", function () {
                    return _this.appController.markdownEditor.setMode(Editor.EditorMode.EditorOnly);
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
                this.appController.save();
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
//# sourceMappingURL=App.js.map
