/**
 * @class Application.components.AdminContentEdit
 * @extends Application.components.ContentViewBase
 *
 * Панель редактирования страниц помощи.
 *
 */
Ext.define('Application.components.AdminContentEdit', {
  extend        : 'Application.components.ContentViewBase',

  newPage       : 'Новая страница', // Исходное название страницы
  newSection    : 'Новый раздел',   // и раздела при создании.

  initComponent : function () {

    this.editable = true;
    var panel = this;
    var store, rec;

    Ext.apply(this.menuCfg, {
      header        : false,
      enableDD      : this.editable,
      containerScroll : this.editable,

      tbar          : [{
        xtype         : 'buttongroup',
        columns       : 1,
        defaults      : {
          scale         : 'small'
        },
        items         : [{
          iconCls       : 'menu-add-page',
          text          : 'Создать страницу',
          ref           : '../../addpage',
          handler       : function(button) {
            //var panel = button.findParentByType('Application.components.AdminContentEdit');
            var tree = panel.menu;

            var newNode = tree.getLoader().createNode({
              newitem   : true,
              text      : panel.newPage,
              weight    : 1000,
              leaf      : true
            });
            var nodeEl = tree.getRootNode().appendChild( newNode );

            tree.editor.triggerEdit(newNode);
          } // add page handler
        }, {
          iconCls   : 'menu-add-group',
          text      : 'Создать раздел',
          ref       : '../../addgroup',
          handler   : function(button) {
            //var panel = button.findParentByType('Application.components.AdminContentEdit');
            var tree = panel.menu;

            var newNode = tree.getLoader().createNode({
              newitem : true,
              text    : panel.newSection,
              weight  : 1000,
              leaf    : false
            });
            var nodeEl = tree.getRootNode().appendChild( newNode );

            tree.editor.triggerEdit(newNode);
          } // add group handler
        }] // add group items
      }, {
        xtype     : 'buttongroup',
        columns   : 1,
        defaults  : {
          scale: 'small'
        },
        items: [{
          iconCls   : 'menu-delete-item',
          text      : 'Удалить',
          ref       : '../../deletebtn',
          disabled  : true,
          handler   : function(button) {
            var tree = panel.menu;
            var sm = tree.getSelectionModel();
            var node = sm.getSelectedNode();
            tree.disable();
            RPC.Admin.contentedit({
              request   : 'MENU',
              item      : {
                id      : node.attributes.id,
                remove  : true
              }
            },
            function(resp) {
              if (!resp.success) {
                echoResponseMessage(resp);
              } else {
                // Удаляем ноду.
                node.remove(true);
                tree.getRootNode().reload();
              }
              tree.enable();
            });

          }
        }] // remove group items
      }] // menu tbar

    }); // menuCfg override

    Ext.apply(this.menuCfg.listeners, {

      startdrag      : function(tree, node, event) {
        tree.ddSaveState = {
          parentNode      : node.parentNode ? node.parentNode.id : null,
          previousSibling : node.previousSibling ? node.previousSibling.id : null,
          nextSibling     : node.nextSibling ? node.nextSibling.id : null
        };
      }, // startdrag listener

      enddrag      : function(tree, node, event) {
        var items = [];
        var newState = {
          parentNode      : node.parentNode ? node.parentNode.id : null,
          previousSibling : node.previousSibling ? node.previousSibling.id : null,
          nextSibling     : node.nextSibling ? node.nextSibling.id : null
        };
        if (newState.parentNode !== tree.ddSaveState.parentNode) {
          tree.disable();
          RPC.Admin.contentedit({
            request   : 'MENU',
            item      : {
              id      : node.attributes.id,
              parent  : newState.parentNode
            }
          },
          function(resp) {
            if (!resp.success) {
              // Возвращаем ноду на старое место.
              tree.getNodeById(
                tree.ddSaveState.parentNode
              ).appendChild( node );
              echoResponseMessage(resp);
            }
            tree.enable();
          });
        }
        // TODO: Реализовать сортировку на основе weight

      }, // enddrag listener

      beforerender  : function() {
        var tree = this;
        var panel = tree.refOwner;
        var fp = panel.content;

        tree.on('click', function() {
          tree.deletebtn.enable();
        });

        this.editor = new Ext.tree.TreeEditor(this, {
          allowBlank    : false,
          blankText     : 'Необходимо задать заголовок'
        }, {
          editDelay     : 50,
          listeners     : {
            complete      : function(editor, value, startValue) {
              var newItem = false;
              if (value == startValue && !editor.editNode.attributes.newitem)
                return true;
              if (editor.editNode.attributes.newitem)
                newItem = true;
              tree.disable();
              RPC.Admin.contentedit({
                request   : 'MENU',
                item      : Ext.copyTo(
                  {title    : value},
                  editor.editNode.attributes,
                  'id, leaf, newitem, weight'
                )
              },
              function(resp) {
                if (!resp.success) {
                  // Возвращаем старый текст.
                  if (newItem) {
                    editor.editNode.remove(true);
                  } else {
                    editor.editNode.setText(startValue);
                  }
                  echoResponseMessage(resp);
                } else {
                  if (newItem && resp.page && resp.page.id) {
                    editor.editNode.setId(resp.page.id);
                    delete(editor.editNode.attributes.newitem);
                  }
                }
                tree.enable();
              });
              return true;
            }, // complete listener

            startedit     : function(el, value) {
              if (value == panel.newSection || value == panel.newPage) {
                this.field.selectText();
              }
            } // startedit listener
          } // listeners
        }); // TreeEditor init
      } // beforerender listener
    }); // menuCfg listeners override



    /*********************************************************************************
     *                  Окно для загрузки и вставки изображения                      *
     *********************************************************************************/

    // Инициализируем заранее, т.к. будет использоваться ниже в коллбеках.
    var imageEditorPlugin = new Ext.ux.form.HtmlEditor.Image();

    /**
     * Префикс пути для сохранения URL изображений.
     *
     */
    var helpImagesUrlPrefix = 'help/';

    var insertImageWindowCfg = {
      xtype         : 'window',
      title         : 'Выберите изображение',
      cls           : 'window-image-chooser',
      constrainHeader : true,
      constrain     : true,
      shadow        : false,
      layout        : 'fit',
      width         : 700,
      height        : 550,
      //autoHeight    : true,
      modal         : true,
      closeAction   : 'hide',
      border        : false,
      items         : [{
        xtype       : 'tabpanel',
        border      : false,
        //autoHeight  : true,
      height        : 550,
        activeTab   : 0,
        items         : [{
          xtype         : 'form',
          frame         : true,
          border        : false,
          height        : 300,
          title         : 'Загрузить изображение',

          method        : 'POST',
          fileUpload    : true,

          api           : {
            submit        : RPC.Admin.contentUpload
          },

          items         : [
            {
              xtype       : 'Application.components.UploadFilePanel',
              fieldName   : 'path',
              anchor      : '100%',
              hideLabel     : true,
              //labelWidth  : 200,
              //label       : 'Выберите файл',
              allowCancel : false
            }, {
              anchor      : '100%',
              labelWidth  : 200,
              xtype       : 'textfield',
              name        : 'url',
              vtype       : 'url',
              fieldLabel  : 'Или укажите URL изображения'
            }, {
              anchor      : '100%',
              labelWidth  : 200,
              bodyStyle   : 'padding-top: 10px',
              xtype       : 'textarea',
              name        : 'text',
              fieldLabel  : 'Описание изображения'
            }
          ],
          listeners     : {
            afteruploaded : function(response) {
              var resp = response.result;

              if (!resp.success) {
                echoResponseMessage(response);
                return false;
              }

              var win = this.findParentByType('window');
              win.close();

              var img = {
                path      : helpImagesUrlPrefix + resp['file'],
                title     : resp['text']
              };
              imageEditorPlugin.insertImage(img);
            },
            beforerender  : function() {
              this.addEvents('afteruploaded');
            }
          },
          buttons       : [{
            text          : 'Вставить изображение',
            iconCls       : 'help-add-image',
            formBind      : true,

            handler       : function(button) {
              var fp = button.findParentByType('form');
              var win = button.findParentByType('window');
              var form = fp.getForm();

              if ( form.isValid() ) {
                var values = form.getValues();
                if (values.url) {
                  win.close();
                  imageEditorPlugin.insertImage({
                    path      : values.url,
                    title     : values.text
                  });
                } else {
                  performSave(fp, null, 'afteruploaded', true, false);
                }
              }
            }
          }] // form buttons

        }, {
          xtype         : 'panel',
					autoScroll    : true,
          border        : false,
          height        : 550,
          title         : 'Выбрать загруженный файл',
          cls           : 'img-chooser',
          tbar          : [{
            text          : 'Переименовать',
            iconCls       : 'help-rename-image',
            ref           : '../renamebtn',
            disabled      : true,
            handler       : function(button) {
              var view = button.refOwner.view;
              store = view.getStore();
              var records = view.getSelectedRecords();
              if (records.length == 0)
                return false;

              var rec = records[0];

              var oldText = rec.get('text');
              Ext.Msg.prompt('Переименование', 'Новое название:', function(btn, text) {
                if (btn == 'ok' && text != oldText) {
                  RPC.Admin.contentedit({
                    request   : 'IMAGE',
                    item      : {
                      id      : rec.get('id'),
                      text    : text,
                      rename  : true
                    }
                  },
                  function(resp) {
                    if (resp && resp.success) {
                      // Переименовываем картинку в списке.
                      rec.set('text', text);
                    } else if (resp) {
                      echoResponseMessage(resp);
                    }
                  });
                }
              }, this, false, oldText);
            } // rename handler
          }, '-', {
            text          : 'Удалить',
            iconCls       : 'help-delete-image',
            ref           : '../deletebtn',
            disabled      : true,
            handler       : function(button) {
              var view = button.refOwner.view;
              store = view.getStore();

              var records = view.getSelectedRecords();
              if (records.length > 0) {
                var rec = records[0];

                RPC.Admin.contentedit({
                  request   : 'IMAGE',
                  item      : {
                    id      : rec.attributes.id,
                    remove  : true
                  }
                },
                function(resp) {
                  if (!resp.success) {
                    echoResponseMessage(resp);
                  } else {
                    // Удаляем картинку из списка.
                    store.remove(rec);
                  }
                });
              }
            }
          }], // tbar
          bbar          : ['->', {
            text          : 'Вставить выбранное',
            iconCls       : 'help-select-image',
            ref           : '../selectbtn',
            disabled      : true,
            handler       : function(button) {
              var view = button.refOwner.view;
              view.doSelect(view);
            }
          }], // bbar

          items         : [{
            xtype         : 'dataview',
            ref           : 'view',
            singleSelect  : true,
            overClass     : 'x-view-over',
            itemSelector  : 'div.thumb-wrap',
            emptyText     : '<div style="padding: 10px;">Нет загруженных изображений.</div>',
            tpl           : new Ext.XTemplate(
              '<tpl for=".">',
                '<div class="thumb-wrap" id="help-picture-{id}">',
                  '<div class="thumb">',
                    '<img src="{thumbUrl}" alt="{text}" height="100" />',
                  '</div>',
                  '<span class="x-editable">{shortText}</span>',
                '</div>',
              '</tpl>'
            ),

            doSelect        : function(view) {
              var view = view || this;
              var records = view.getSelectedRecords();
              if (records.length > 0) {
                rec = records[0];

                var win = view.findParentByType('window');
                imageEditorPlugin.insertImage({
                  path      : rec.get('url'),
                  title     : rec.get('text')
                });
                win.close();
              }
            },

            listeners     : {
              'click'           : function(view, index, node) {
                //var rec = view.getRecord(node);
                view.ownerCt.selectbtn.enable();
                view.ownerCt.renamebtn.enable();
                view.ownerCt.deletebtn.enable();
                return true;
              },
              'dblclick'        : function(view, index, node) {
                // Картинка выбрана.
                view.doSelect(view);
              },
              'loadexception'   : function(view) {
                // если стора не загрузилась, то...

              },
              'beforeselect'    : function(view, node) {
                // Нет выбора если нет картинок.
                return view.store.getRange().length > 0;
              }
            }, // dataview listeners
            prepareData   : function(data) {
              data.shortText = Ext.util.Format.ellipsis(data.text, 15);
              data.url = helpImagesUrlPrefix + data.title;
              data.thumbUrl = helpImagesUrlPrefix + 'thumb-' + data.title;
              return data;
            }, // prepareData dataview
            store         : {
              xtype         : 'directstore',
              autoLoad      : true,
              directFn      : RPC.Admin.contenFileList,
              paramsAsHash  : true,
              fields        : ['id', 'title', 'text'],
              root          : 'files'
            } // datview store
          }] // dataview panel items
        }] // accordion items
      }] // window items
    } // insertImageWindowCfg


    imageEditorPlugin.insertImage = function(img) {
      var html = '<img src="'+img.path+'" alt="'+img.title+'" />';
      html += '<br/>'+img.title+'<br/>';
      //console.debug(html);
      this.cmp.insertAtCursor(html);
    }
    imageEditorPlugin.selectImage = function() {
      var insertImageWindow = new Ext.Window(insertImageWindowCfg);
      insertImageWindow.show();
    }
    /*********************************************************************************
     *                  Окно для загрузки и вставки изображения                      *
     *********************************************************************************/


    Ext.apply(this.contentCfg, {
      items         : [{
        xtype         : 'htmleditor',
        name          : 'text',
        ref           : 'text',
        border        : false,
        bodyBorder    : false,
        hideLabel     : true,
        plugins       : [
          new Ext.ux.form.HtmlEditor.Word(),
          new Ext.ux.form.HtmlEditor.UndoRedo(),
          new Ext.ux.form.HtmlEditor.Divider(),
          new Ext.ux.form.HtmlEditor.Link(),
          imageEditorPlugin,
          new Ext.ux.form.HtmlEditor.Divider(),
          new Ext.ux.form.HtmlEditor.FindAndReplace(),
          new Ext.ux.form.HtmlEditor.IndentOutdent(),
          new Ext.ux.form.HtmlEditor.Table(),
          new Ext.ux.form.HtmlEditor.HR(),
          new Ext.ux.form.HtmlEditor.SpecialCharacters(),
          new Ext.ux.form.HtmlEditor.SubSuperScript(),
          new Ext.ux.form.HtmlEditor.RemoveFormat()
        ]
      }], // items

      buttons         : [{
        text            : 'Сохранить',
        iconCls         : 'help-save-page',
        scope           : this,
        formBind        : true,

        handler         : function(button) {
          var fp = this.content;
          var form = fp.getForm();

          if ( form.isValid() ) {
            performRPCCall(
              RPC.Admin.contentedit,
              [Ext.apply(form.getValues(), {
                id      : this.contentId,
                request : 'TEXT'
              })],
              {mask_el: fp, scope: this},
              function(resp) {
                echoResponseMessage(resp);
              }
            );
          }
        } // save handler
      }] // buttons

    }); // contentCfg


    Ext.apply(this.contentCfg.listeners, {
      afterrender   : function() {
        // Ext 3 bug workaround
        // http://www.sencha.com/forum/showthread.php?97048-HtmlEditor-grey-text-bug-introduced-in-Ext-3.2-(disabled-true)
        this.disable.defer(1000, this);
      }
    });

    Application.components.AdminContentEdit.superclass.initComponent.call(this);
  } // initComponent

}); // Application.components.AdminContentEdit
