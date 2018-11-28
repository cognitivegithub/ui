/**
 * Панель для поиска документов по процедурам.
 */
Ext.define('Application.components.AdminSearchDocs', {
  extend        : 'Ext.grid.Panel',
  editable      : true,
  border        : false,
  bodyBorder    : false,

  initComponent : function() {

    var searchBar = {
      xtype: 'Application.components.searchToolbar',
      eventTarget: this,

      advancedSearch: [{
            xtype       : 'textfield',
            fieldLabel  : 'Процедура',
            name        : 'regustry_number'
          }, {
            xtype       : 'dateinterval',
            name        : 'date_published',
            fieldLabel  : 'Дата публикации'
          }, {
            xtype       : 'textfield',
            fieldLabel  : 'Номер документа',
            name        : 'number'
          }, {
            xtype       : 'dateinterval',
            name        : 'date_generated',
            fieldLabel  : 'Дата документа'
          }, {
            xtype       : 'textfield',
            fieldLabel  : 'Контрагент',
            name        : 'contragent'
          }, {
            xtype       : 'textfield',
            fieldLabel  : 'ИНН',
            name        : 'inn'
          }]
    }; // form config


    var selectionModel = new Ext.grid.CheckboxSelectionModel();
    var columnModel = new Ext.grid.ColumnModel({
      defaults      : {
        sortable      : true
      },
      columns       : [
        selectionModel,
        {
          header      : 'Идентификатор',
          dataIndex   : 'id',
          tooltip     : 'Идентификатор',
          width       : 20,
          hidden      : true
        }, {
          header      : 'Плательщик',
          dataIndex   : 'full_name',
          tooltip     : 'Плательщик'
        }, {
          header      : 'ИНН',
          dataIndex   : 'inn',
          tooltip     : 'ИНН плательщика',
          width       : 70
        }, {
          header      : 'Реестровый №',
          dataIndex   : 'registry_number',
          tooltip     : 'Реестровый №',
          width       : 70
        }, {
          header      : 'Сумма',
          dataIndex   : 'price',
          renderer    : Ext.util.Format.price,
          align       : 'right',
          width       : 50,
          tooltip     : 'Сумма'
        }, {
          header      : 'Заказчик',
          dataIndex   : 'customer',
          tooltip     : 'Заказчик'
        }, {
          header      : 'Акт',
          dataIndex   : 'number',
          tooltip     : 'Акт',
          width       : 80
        }, {
          header      : 'Дата отправки акта',
          tooltip     : 'Дата отправки акта',
          dataIndex   : 'date_forwarded',
          width       : 50,
          editor      : new Ext.form.DateField({
            format      : 'd.m.Y'
          }),
          renderer    : Ext.util.Format.dateRenderer('d.m.Y')
        }, {
          header      : 'Дата подписания акта',
          tooltip     : 'Дата подписания акта',
          dataIndex   : 'date_signed',
          width       : 50,
          editor      : new Ext.form.DateField({
            format      : 'd.m.Y'
          }),
          renderer    : Ext.util.Format.dateRenderer('d.m.Y')
        }, {
          header      : 'Дата списания',
          dataIndex   : 'date_generated',
          tooltip     : 'Дата списания',
          width       : 50,
          renderer: Ext.util.Format.dateRenderer('d.m.Y')
        }, {
          header      : 'Действия',
          xtype       : 'textactioncolumn',
          actionsSeparator: ' ',
          //dataIndex   : 'id',
          sortable    : false,
          tooltip     : 'Действия',
          width       : 50,
          items: [{
              icon: '/ico/certified_small.png',
              text: '',
              tooltip: "Загрузить документ",
              href: function(v, m, record) {
                return ('/file/getact/act/' + record.data.id);
              }
          }, {
              icon: '/ico/document.png',
              text: '',
              tooltip: "Загрузить документ без факсимиле",
              href: function(v, m, record) {
                return ('/file/getact/t/nostamp/act/' + record.data.id);
              }
          }],
          scope: this
        }

      ] // columns definition
    }); // ColumnModel

    // DirectStore, возвращает список актов гриду.
    var store = createFiscalDocsGridStore();

    Ext.apply(this, {
      xtype       : 'editorgrid',
      ref         : 'grid',
      flex        : 1,
      autoScroll  : true,
      clicksToEdit : 2,
      viewConfig  : {
        forceFit    : true,
        scrollOffset : 2,
        enableRowBody : false,
        showPreview : false
      },
      cm          : columnModel,
      sm          : selectionModel,
      store       : store,
      loadMask    : true,

      tbar: searchBar,
      // paging bar on the bottom
      bbar        : renderPagingToolbar('Документы', store, 50, [
        '-',
        {
          xtype     : 'button',
          text      : 'Сохранить изменения',
          iconCls   : 'icon-accept',
          scope     : this,
          handler   : function(button) {
            //var grid = button.findParentByType('editorgrid');
            this.stopEditing();
            var acts = [];
            var records = store.getModifiedRecords();
            Ext.each(records, function(record) {
              var cols = record.getChanges();
              if ( !Ext.isEmpty(cols['date_forwarded']) )
                cols['date_forwarded'] = cols['date_forwarded'].format('Y-m-d H:i:s');
              if ( !Ext.isEmpty(cols['date_signed']) )
                cols['date_signed'] = cols['date_signed'].format('Y-m-d H:i:s');
              cols.id = record.data.id;
              acts.push(cols);
            });

            //console.debug(acts);
            if (0==acts.length) {
              return;
            }
            performRPCCall(RPC.Admin.updateFiscalDocs, [{acts: acts}], {mask_el: this}, function(resp) {
              echoResponseMessage(resp);
              if (resp.success) {
                store.commitChanges();
              }
            });
          }
        },
        '-',
        {
          xtype     : 'button',
          text      : 'Скачать все выбранные акты одним файлом',
          iconCls   : 'icon-silk-disk_multiple',
          handler   : function() {
            var acts = [];
            selectionModel.each(function(item) {
              acts.push(item.data.id);
            });
            if (acts.length) {
              var params = {
                acts       : Ext.encode(acts)
              };
              performAjaxRPCCall('/file/getact', params, {download  : true, wait_disable: true});
            }
          } // handler кнопки «Скачать акты»
        }
      ]), // bbar config
      menuItems: [{
        text: 'Информация о поставщике',
        handler: function(b, e, row, grid) {
          grid.showSupplierWindow(row.data);
        }
      },
      {
        text: 'Аннулировать акт',
        handler: function(b, e, row, grid) {
          grid.cancelDocWindow(row.data);
        }
      },
      {
        text: 'Поставить в очередь синхронизации с ЭДО',
        handler: function(b, e, row, grid) {
          grid.Doc2SyncWindow(row.data);
        }
      }]
    });

    this.listeners = this.listeners||{};
    Ext.apply(this.listeners, {
        search       : function(query, search_params) {
          var store = this.getStore();
          store.setBaseParam('query', query);
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 50);
          if (search_params) {
            for (var sp in search_params)
              store.setBaseParam(sp, search_params[sp]);
          }
          store.load();
        },
        celldblclick: function (grid, rowIndex, columnIndex) {
          var column = grid.getColumnModel().getColumnId(columnIndex);
          if (1==column || 2==column) { //только по клику на поставщика
            //var record = grid.getSelectionModel().getSelected().data;
            var record = grid.getStore().getAt(rowIndex).data;
            grid.showSupplierWindow(record);
          }
        }
    })
    this.plugins = this.plugins||[];
    this.plugins.push(Ext.ux.plugins.GridMenu);

    Application.components.AdminSearchDocs.superclass.initComponent.call(this);
  }, // initComponent
  cancelDocWindow: function(record) {
    var cmp = this;
    Ext.Msg.prompt('', 'Укажите причину аннулирования акта:', function(btn, text){
    if (btn === 'ok') {
      var params = {
        reason_text: text,
        doc_id: record.id
      };
      performRPCCall(RPC.Finance.cancelact, [params], null, function(resp){
        echoResponseMessage(resp);
        cmp.getStore().reload();
      });
     }
    });
    return false;
  },
  Doc2SyncWindow: function(record) {
    Ext.Msg.confirm('Синхронизация', 'Добавить документ в очередь синхронизации с ЭДО?', function(btn, text){
    if (btn === 'yes') {
      var params = {
        doc_id: record.id
      };
      performRPCCall(RPC.Finance.doctosync, [params], null, function(resp){
        echoResponseMessage(resp);
      });
     }
    });
    return false;
  },
  showSupplierWindow: function(record) {
    var id = Ext.id();
    var renderInfo = function(title, text) {
      return '<div class="normal-text"><b>'+title+'</b>: '+text+'</div>';
    }
    var win = new Ext.Window({
      autoHeight: true,
      closeAction: 'close',
      width: 600,
      layout: 'fit',
      constrain: true,
      title: 'Сведения о поставщике',
      items: [{
        frame: true,
        autoHeight: true,
        width: '100%',
        items: [{
          html: renderInfo('Участник', record.full_name)
        }, {
          html: renderInfo('Л/с', record.account /*+
                                  ' (<a href="/admin/supplier/transactionslog/id/'+record.supplier_id+'">история</a>'+
                                  ', <a href="/admin/supplier/corrector/id/'+record.supplier_id+'">корректор</a>)'*/)
        }, {
          html: renderInfo('ИНН', record.inn)
        }, {
          html: renderInfo('КПП', record.kpp)
        }, {
          xtype: 'checkbox',
          id: id,
          checked: record.prefer_stamped_docs,
          boxLabel: 'генерировать документы с факсимиле'
        }]
      }],
      buttonAlign: 'right',
      buttons: [{
        text: 'Сохранить',
        scope: this,
        handler: function() {
          var preference = Ext.getCmp(id).getValue();
          var params = {
            prefer_stamped_docs: preference?1:0
          };
          var cmp = this;
          performRPCCall(RPC.Company.adminEdit, [record.supplier_id, params], null, function(resp){
            echoResponseMessage(resp);
            cmp.getStore().reload();
            if (resp.success) {
              win.close();
            }
          });
        }
      }, {
        text: 'Отмена',
        handler: function() {win.close()}
      }]
    });
    win.show();
    return false;
  }
}); // Application.components.AdminSearchDocs