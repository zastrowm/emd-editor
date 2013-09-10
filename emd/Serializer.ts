///<reference path="EmbeddedMarkdown.ts" />
///<reference path="Hexpect.ts" />
///<reference path="Shim.ts" />
module EmbeddedMarkdown {




  export function serialize(doc: EmdDocument): HTMLElement {
    return Serializer.Serialize(doc);
  }

  export function deserialize(htmlElement: HTMLElement): EmdDocument {
    return Serializer.Deserialize(htmlElement);
  }

  export function toElement(doc: EmdDocument): HTMLElement {
    return Serializer.Serialize(doc);
  }

  export function toString(doc: EmdDocument): string {
    return toElement(doc).innerHTML;
  }

  export function fromElement(element: HTMLElement): EmdDocument {
    return Serializer.Deserialize(element);
  }

  export function fromString(content: string): EmdDocument {
    var element = document.createElement("html");
    var fakeElement = document.createElement("html");
    element.appendChild(fakeElement);
    fakeElement.outerHTML = content;
    return fromElement(element);
  }

  interface ElementDefinition {
    tag: string;

    children: ElementDefinition[];

    html: string;

    text: string;
  }

  function create(definition: ElementDefinition): HTMLElement {

    var element = <HTMLElement>document.createElement(definition.tag);

    Object.keys(definition)
        .filter(key => key.indexOf("$") == 0)
        .forEach(key => {
          element.setAttribute(key.substr(1), definition[key]);
        })

    if (definition.children != null) {
      definition.children.forEach(child => {
        element.appendChild(create(child))
      })
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
  class Serializer {

    private static nameAttributeName = "data-emd-name";
    private static versionAttributeName = "data-emd-version";
    private static metaDataScriptId = "-emd-meta";
    private static imagesId;

    public static Serialize(doc: EmdDocument): HTMLElement {

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
                html: doc.renderedHtml
              },
              {
                tag: "DIV",
                $id: "-emd-document",
                $style: "display: none;",
                children: [
                  {
                    tag: "DIV",
                    $id: "-emd-content",
                    children: doc.parts.items.map(item => {
                      return {
                        tag: 'SCRIPT',
                        $type: "text/x-emd-markdown",
                        //TODO allow extensibility
                        '$data-emd-name': 'body',
                        text: EmbeddedMarkdown.Shim.base64encode(item)
                      }
                    })
                  },
                  {
                    tag: "DIV",
                    $id: "-emd-images",
                    children: doc.images.items.map(image => {
                      return {
                        tag: "IMG",
                        '$src': image.data,
                        '$data-emd-name': image.name,
                        '$alt': ""
                      }
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
      }

      return create(<ElementDefinition><any>definition);

    }

    public static Deserialize(element: HTMLElement): EmdDocument {
      Serializer.VerifyConformance(element);

      var strVersion = element.getAttribute(Serializer.versionAttributeName);

      var doc = new EmdDocument();
      //doc.version = Version.fromString(strVersion);

      var get = selector => <HTMLElement>element.querySelector(selector);
      var gets = selector => {
        var result = element.querySelectorAll(selector);
        return  <HTMLElement[]>Array.prototype.slice.call(result, 0);
      }

      gets("#-emd-content script").forEach(e => {
        var script = <HTMLElement>e;
        var name = script.getAttribute("data-emd-name");
        var content = EmbeddedMarkdown.Shim.base64decode(script.textContent);
        doc.parts.add(name, content);
      })

      gets("#-emd-images img").forEach(e => {
        var image = <HTMLImageElement>e;
        var name = image.getAttribute("data-emd-name");
        var data = image.getAttribute("src");
        doc.images.add(name, new EmbeddedMarkdown.Image(name, data));
      });

      return doc;
    }

    private static VerifyConformance(html: HTMLElement) {
     var grammar = '' +
'html\n' +
'  head\n' +
'    meta\n' +
'      @charset="utf-8", Meta tag requires charset of "utf-8"\n' +
'    title\n' +
'    script\n' +
'      @type="application/json"\n' +
'      @id="-emd-meta"\n' +
'    style*\n' +
'      @data-emd-name, Missing name on style tag\n' +
'    script*\n' +
'      @data-emd-name,\n' +
'\n' +
'  body\n' +
'    div\n' +
'      @id="-emd-rendered"\n' +
'      **\n'+
'    div\n' +
'      @id="-emd-document"\n' +
'      @style="display: none;"\n' +
'      div\n' +
'        @id="-emd-content"\n' +
'        script\n' +
'          @type="text/x-emd-markdown"\n' +
'          @data-emd-name\n' +
'      div\n' +
'        @id="-emd-images"\n' +
'        img*\n' +
'          @data-emd-name\n' +
'          @alt=""\n' +
'          @src\n' +
'      div\n' +
'        @id="-emd-extra"\n' +
'        **\n' +
'';

      grammar = grammar.replace(/  /g, '\t');
      var validator = Hexpect.createValidator(grammar);
      validator.validate(html);
    }

    private static SerializeAndAppend<T>(
        parent: HTMLElement,
        items: T[],
        serialize: (item: T) => HTMLElement
        )
    {
      for (var i = 0; i < items.length; i++) {
        var image = <T>items[i];
        parent.appendChild(serialize(image));
      }
    }

    /**
     * Serialize an image into an html element
     * @param image the image to serialize
     * @returns the image, serialized to an html element
     */
    private static SerializeImage(image: Image): HTMLElement {
      var element = document.createElement('img');

      element.setAttribute("src", image.data);
      element.setAttribute("alt", "");
      element.setAttribute(Serializer.nameAttributeName, image.name);

      return element;
    }

    /**
     * Deserialize an html element into an image
     * @param element the element to deserialize into an image
     * @returns the image that was deserialized from the image, or null
     * if the element could not be deserialized
     */
    private static DeserializeImage(element: HTMLElement): Image {

      if (element.tagName != "IMG")
        return null;

      var src = element.getAttribute("src");
      var name = element.getAttribute(Serializer.nameAttributeName);

      return new Image(name, src);
    }

  }

}
