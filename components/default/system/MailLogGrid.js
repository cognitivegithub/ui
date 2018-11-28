
 Ext.define('Application.components.MailLogGrid', {
  extend:  'Ext.grid.Panel',
  frame : true,
  border : false,
  id: 'mailLogPanel',
  initComponent : function () {
    this.addEvents('search');
    var component = this;
    var store = createMailLogStore();

    var procedure_title_id = Ext.id();

    var advanced_search = [{
        xtype: 'textfield',
        fieldLabel: 'Тема уведомления',
        name: 'subject'
      }, {
        xtype: 'textfield',
        fieldLabel: 'ID',
        name: 'procedure_id'
      }];
    if (isAdmin()) {
      advanced_search.push({
        xtype: 'textfield',
        fieldLabel: 'Имя пользователя',
        name: 'user_fio'
      }, {
        xtype: 'textfield',
        fieldLabel: 'ИНН организации',
        name: 'company_inn'
      });
    }
    
    function dateTimeSendRenderer(value) {
      if (!value) {
        return 'ожидает отправки';
      }
      return Ext.util.Format.date(value, 'd.m.Y H:i');
    }
    
    function contragentRenderer(value, p, record) {
      if (!value) {
        return '';
      }
      return String.format('<a href="/#company/profile/id/{0}">{1}</a>', record.get('contragent_id'), record.get('contragent_fullname'));
    }

    function userRenderer(value, p, record) {
      if (!value) {
        return '';
      }
      return String.format('<a href="/#user/view/id/{0}">{1}</a>', record.get('user_id'), record.get('user_fullname'));
    }

    function mailLogPreviewWindow(grid, rowIndex, colIndex) {
      var store = grid.getStore();
      var record = store.getAt(rowIndex);
      performRPCCall(RPC.Log.loadmaillog, [{ id: record.id }], {wait_text: 'Получаем данные'}, function(response) {
        var win = new Application.components.promptWindow({
          title: 'Входящее уведомление',
          width: 710,
          cmpType: 'Application.components.PopupInfoForm',
          cmpParams: {
            cmp_width: 700,
            cmp_html: '<b>Тема:</b><br />' +  response.mail_item.subject
            + '<br /><br /><b>Содержание:</b><br />' + response.mail_item.body
          }
        });
        win.show();
      });
    }

    var cols = [];
    cols.push(
      {
        header: 'ID', width: 15, dataIndex: 'procedure_id',
        renderer: function(value){
          return value ? value : '--';
        }
      },
      {
        header: 'Наименование закупки',
        width: 30,
        dataIndex: 'title',
        id: procedure_title_id,
        renderer: function (value) {
          return component.mailLogInfoLinkRenderer(value ? value : '--');
        }
      },
      {header: 'Дата отправки', width: 20, dataIndex: 'datetime_sent', renderer: dateTimeSendRenderer, sortable: true});
    if (isAdmin()) {
      cols.push({
        header: 'Пользователь',
        width: 50,
        dataIndex: 'user_fullname',
        renderer: userRenderer,
        sortable: false
      });
    }
    cols.push({header: 'Тема', dataIndex: 'subject', sortable: true},
             {header: 'Операции', xtype: 'textactioncolumn', width: 15, actionsSeparator: ' ',
            items:[{
              tooltip: 'Просмотр',
              icon: '/ico/settings/browse.png',
              isHidden: function(v, m, r) {
                return false;
              },
              handler: function (grid, rowIndex, colIndex) {
                mailLogPreviewWindow(grid, rowIndex, colIndex);
              }
            }]
          });

    Ext.apply(this,
    {
      store: store,
      columns: cols,
      viewConfig: {
        forceFit: true
      },
      bbar: renderPagingToolbar('Записи', store, 50),
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        searchHelp: 'Содержимое темы уведомления',
        advancedSearch: advanced_search
      },
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      listeners: {
        render: function() {
          this.fireEvent('search');
        },
        search: function(query, search_params) {
          var store = this.getStore();
          store.setBaseParam('subject', query);
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 50);
          if (search_params) {
            for (var sp in search_params)
              store.setBaseParam(sp, search_params[sp]);
          }
          store.load();
        },
        cellclick : function(grid, rowIndex, colIndex) {
          var colId = grid.getColumnModel().getColumnAt(colIndex).id;
          if (colId == procedure_title_id) {
            mailLogPreviewWindow(grid, rowIndex, colIndex);
          }
        }
      }
    }
    );

    Application.components.LogGrid.superclass.initComponent.call(this);
  },
   mailLogInfoLinkRenderer: function (value) {
     return '<a href="#" onClick="return false;">' + value + '</a>';
   }
});
