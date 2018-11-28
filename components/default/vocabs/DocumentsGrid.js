/**
 * Компонент выводит грид шаблонов документов.
 * Параметры:
 */
Ext.define('Application.components.VocabDocumentsGrid', {
  extend: 'Ext.grid.Panel',
  frame: true,
  border: false,
  initComponent: function() {
    var store = new Ext.data.DirectStore({
      autoDestroy: true,
      directFn: RPC.Admin.vocabDocTemplateList,
      sortInfo: {field: 'id', direction: 'desc'},
      totalProperty: 'totalCount',
      paramsAsHash: true,
      idProperty: 'id',
      root: 'rows',
      remoteSort: true,
      autoLoad: false,
      fields: ['id', 'name', 'code', {name: 'date_last_saved', type: 'date', dateFormat: 'c'}]
    });

    var cm = new Ext.grid.ColumnModel({
      defaults: {
        sortable: true
      },
      columns: [{
        id: 'id',
        header: '#',
        dataIndex: 'id',
        width: 10
      }, {
        header: 'Название шаблона документа',
        dataIndex: 'name'
      }, {
        header: 'Уникальный код',
        dataIndex: 'code'
      }, {
        header: 'Дата создания/последнего изменения',
        dataIndex: 'date_last_saved',
        renderer: Ext.util.Format.dateRenderer('d.m.Y H:i:s'),
        width: 20
      }]
    });

    var getWindow = function(id, name, code, content, action) {
      var winId = Ext.id();
      var form_id=Ext.id(), form_name=Ext.id(), form_content=Ext.id(), form_action=Ext.id(), property_form=Ext.id();
      return new Ext.Window({
        title: 'Редактировать/Добавить',
        width:850,
        height:500,
        plain: true,
        id: winId,
        items: new Ext.form.FormPanel({
          id: property_form,
          bodyStyle: 'padding-top: 2px; background-color: #CAD8EA',
          labelWidth: 130,
          border: false,
          defaults: {width: 670, labelStyle: 'font-weight: bold', bodyStyle: 'background-color: #CAD8EA'},
          items: [{
            xtype: 'hidden',
            id: form_action,
            name: 'action',
            value: action
          }, {
            xtype: 'hidden',
            id: form_id,
            name: 'id',
            value: id
          }, {
            xtype: 'textfield',
            fieldLabel: 'Уникальный код (имя константы)<font style="color: red">*</font>',
            allowBlank: false,
            emptyText: 'Введите имя константы этого шаблона',
            name: 'code',
            value: code
          }, {
            xtype: 'textfield',
            id: form_name,
            fieldLabel: 'Название типа документа<font style="color: red">*</font>',
            allowBlank: false,
            emptyText: 'Название документа',
            name: 'name',
            value: name
          }, {
            width: '100%',
            border: false,
            bodyStyle: 'margin-bottom: 10px; background-color: #CAD8EA',
            html: 'Там, где должны автоматически подставляться поля контрагента, необходимо подставлять специальный указатель вида %tablename_fieldname% в соответствии со структурой базы данных системы.'
          }, {
            xtype: 'textarea',
            id: form_content,
            fieldLabel: 'Шаблон документа (html)',
            name: 'content',
            height: 340,
            value: content
          }]
        }),
        buttons: [{
          text: 'Сохранить',
          scope: this,
          handler: function() {
            performRPCCall(RPC.Admin.editVocabDocTemplate, [Ext.getCmp(property_form).getForm().getValues()], {wait_text: 'Идет сохранение...'}, function(result) {
              if(result.success) {
                store.reload();
                Ext.getCmp(winId).close();
              } else {
                echoResponseMessage(result);
              }
            });
          }
        }, {
          text: 'Удалить',
          scope: this,
          handler: function() {
            Ext.MessageBox.confirm('Подтверждение', 'Вы уверены что хотите удалить этот шаблон?', function (btn) {
              if (btn == 'yes') {
                Ext.getCmp(form_action).setValue('delete');
                performRPCCall(RPC.Admin.editVocabDocTemplate, [Ext.getCmp(property_form).getForm().getValues()], {wait_text: 'Идет сохранение...'}, function(result) {
                  if(result.success) {
                    store.reload();
                    Ext.getCmp(winId).close();
                  } else {
                    echoResponseMessage(result);
                  }
                });
              }
            });
          }
        }, {
          text: 'Отмена',
          scope: this,
          handler: function() {
            Ext.getCmp(winId).close();
          }
        }]
      });
    }

    Ext.apply(this, {
      store: store,
      loadMask: {msg: 'Загрузка шаблонов...'},
      hideTitle: true,
      cm: cm,
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      border: false,
      viewConfig: {
        forceFit:true,
        enableRowBody:false,
        scrollOffset: 2/*,
        getRowClass : function(record, rowIndex, p, store) {
          showPreview:false
        }*/
      },
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        items: [{
          text: 'Добавить шаблон',
          cls: 'x-btn-text-icon',
          icon: '/ico/add.png',
          handler: function() {
            var win = getWindow(null, null, null, null, 'insert');
            win.show();
          }
        }, {
          xtype: 'tbspacer', width: 50
        }]
      },
      bbar: renderPagingToolbar('Шаблоны', store, 25, null),
      listeners: {
        render: function() {
          this.fireEvent('search');
        },
        search: function(query, search_params) {
          var store = this.getStore();
          if (search_params) {
            for (var sp in search_params)
              store.setBaseParam(sp, search_params[sp]);
          }
          store.setBaseParam('query', query);
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 25);
          store.load();
        },
        click: {
          scope: this,
          fn: function() {
            var selectedRow = this.getSelectionModel().getSelected();
            if (selectedRow) {
              performRPCCall(RPC.Admin.loadVocabDocTemplate, [{id: selectedRow.data.id}], {wait_text: 'Загрузка шаблона...'}, function(result) {
                var win = getWindow(result.id, result.name, result.code, result.content, 'update');
                win.show();
              });
            }
          }
        }
      }
    });
    Application.components.VocabDocumentsGrid.superclass.initComponent.call(this);
  }
});
