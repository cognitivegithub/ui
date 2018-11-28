/**
 * Грид заявок на участие в процедуре
 *
 * Параметры:
 * directFn - откуда будет подгружаться стора
 * companyType - тип организации, может быть supplier или customer
 * procedureId - id процедуры (если companyType = customer)
 *
 * Евенты:
 *   нет
 */
Ext.define('Application.components.ApplicGrid', {
  extend: 'Ext.grid.GridPanel',
  frame : true,
  border : false,
  id: 'ApplicGrid',
  initComponent : function () {
    this.addEvents('search');
    var component = this;

    var advFields = [];
    var storeParams = {};
    var actionLinks = [];
    // Настройки грида для поставщика
    if (component.companyType == 'my') {
      // Добавляем поле в стору
      advFields.push('registry_number');
      advFields.push('order_number_assigned');
      // Добавляем параметр в стору
      Ext.apply(storeParams, { contragent_type: component.companyType });
      // Настраиваем экшн-ссылки
      actionLinks = [
         {
           tooltip: 'Просмотреть',
           icon: '/ico/settings/browse.png',
           handler: redirectActionHandler('com/applic/view/id/{id}/lot_id/{lot_id}'),
           isHidden: function(v, meta, rec) {
             return false;
           }
         },
         {
           tooltip: 'Подписать',
           icon: '/ico/applics/sign_applic.png',
           handler: redirectActionHandler('com/applic/edit/procedure/{procedure_id}/lot/{lot_id}/application_id/{id}'),
           isHidden: function(v, meta, rec) {
             return !(rec.data.status == 0);
           }
         },
         {
           tooltip: 'Отозвать',
           icon: '/ico/applics/withdraw_applic.png',
           handler: redirectActionHandler('com/applic/cancel/id/{id}'),
           isHidden: function(v, meta, rec) {
             // На переторжке нельзя отозвать завку до заключения договора
             if (rec.data.frm && rec.data.lot_status < 7) {
               return true;
             }
             return !((rec.data.status == 1 && rec.data.lot_status == 2) || (rec.data.order_number_assigned && rec.data.order_number_assigned>3 && rec.data.status==3));
           }
         },
         {
           tooltip: 'Удалить',
           icon: '/ico/delete.png',
           handler: function(grid, rowIndex) {
            Ext.Msg.confirm('Подтверждение', 'Вы уверены что хотите удалить заявку?', function(r) {
              if ('yes' == r) {
                var item = grid.getAt(rowIndex);
                var template = new Ext.Template('com/applic/delete/id/{id}');
                if (item) {
                  redirect_to(template.apply(item.data));
                }
              }
            });
           },
           isHidden: function(v, meta, rec) {
             return !(rec.data.status == 0);
           }
         }
        ];
    } else {
      // Настройки грида для заказчика

      // Добавляем поля в стору
      advFields.push('registry_number');
      advFields.push('supplier_name');
      advFields.push('procedure_type');
      //advFields.push('auction_place');
      //advFields.push('auction_price');
      // Добавляем параметр в стору
      Ext.apply(storeParams, { procedure_id: component.procedureId });
      // Настраиваем экшн-ссылки
      actionLinks = [
         {
           tooltip: 'Просмотреть',
           icon: '/ico/settings/browse.png',
           handler: redirectActionHandler('com/applic/view/id/{id}/lot_id/{lot_id}'),
           isHidden: function(v, meta, rec) {
             if (rec.data.id === null) return true;
             return false;
           }
         }, {
          tooltip: 'Подать запрос на разъяснение заявки',
          icon: '/ico/applics/request.png',
          isHidden: function(v, meta, rec) {
            return !((rec.data.lot_status == 4) && ((rec.data.procedure_type == 1) || (rec.data.procedure_type == 2) || (rec.data.procedure_type == 3)));
          },
          handler: redirectActionHandler('com/procedure/requestapplic/type/request/procedure/{procedure_id}/lot/{lot_id}/application/{id}')
         }
        ];
    }
    var store = createApplicStore(component.directFn, storeParams, advFields);

    function dateRenderer(v, m, rec, n, f) {
      if (rec.data.status < 1) {
        return '—';
      }
      return Ext.util.Format.date(v, 'd.m.Y');
    }
    function timeRenderer(v, m, rec, n, f) {
      if (rec.data.status < 1) {
        return '—';
      }
      return Ext.util.Format.date(v, 'H:i');
    }

    // Для поставщика добавляем поисковой тулбар
    var tbar;
    if (component.companyType == 'my') {
      tbar = {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        searchHelp: 'Быстрый поиск по заявкам',
        advancedSearch: [{
          xtype: 'textfield',
          name: 'registry_number',
          fieldLabel: 'Реестровый номер процедуры'
        },
        {
          xtype: 'combo',
          name: 'status',
          defaultValue: -1,
          fieldLabel: 'Статус заявки',
          mode: 'local',
          store : new Ext.data.ArrayStore({
              id: 0,
              fields: [
                  'id',
                  'name'
              ],
              data: [
                [-1, 'Все'],
                [0, 'Черновик'],
                [1, 'Подана, не рассмотрена'],
                [2, 'Отозвана до рассмотрения'],
                [3, 'Рассмотрена заказчиком, принята'],
                [4, 'Рассмотрена заказчиком, отклонена'],
                [5, 'Исполнитель уклонился от заключения договора']
              ]
          }),
          editable: false,
          valueField: 'id',
          displayField: 'name',
          hiddenName : 'name',
          triggerAction: 'all'
        }]
      };
    }

    /*function statusRenderer(value, meta, record) {
      var result = '';
      switch (value) {
        case null:
          result = 'Черновик';
          break;
        case 1:
          result = 'Подана, не рассмотрена';
          break;
        case 2:
          result = 'Отозвана до рассмотрения';
          break;
        case 3:
          result = 'Рассмотрена заказчиком, принята';
          break;
        case 4:
          result = 'Рассмотрена заказчиком, отклонена';
          break;
        case 5:
          result = 'Исполнитель уклонился от заключения ГК';
          break;
      }
      return result;
    }*/

    var cols = [];
    cols.push({header: 'Реестровый №', dataIndex: 'registry_number', width: 50});
    cols.push({header: 'Номер лота', dataIndex: 'lot_number', width: 30});
    cols.push({header: 'Название процедуры', dataIndex: 'procedure_title', width: 150});
    cols.push({header: 'Дата подачи', dataIndex: 'date_added', width: 40, renderer: dateRenderer});
    cols.push({header: 'Время подачи', dataIndex: 'time_added', width: 40, renderer: timeRenderer});
    cols.push({header: 'Текущий статус', dataIndex: 'status_text', width: 70});
    if (component.companyType != 'my') {
      cols.push({header: 'Наименование заявителя', dataIndex: 'supplier_name', width: 150});
    }
    //cols.push({header: 'Место предложения', dataIndex: 'auction_place', hidden: true});
    //cols.push({header: 'Цена предложения', dataIndex: 'auction_price', hidden: true});
    cols.push({header: 'Операции', xtype: 'textactioncolumn', actionsSeparator: ' ', items: actionLinks, width: 40, sortable: false});

    Ext.apply(this,
    {
      store: store,
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: cols
      }),
      viewConfig: {
        forceFit: true
      },
      bbar: new Ext.PagingToolbar({
          pageSize: 25,
          store: store,
          displayInfo: true,
          displayMsg: 'Пользователи {0} - {1} из {2}',
          emptyMsg: "Список пуст"
      }),
      tbar: tbar,
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      listeners: {
        render: function() {
          this.fireEvent('search');
        },
        search: function(query, search_params) {
          var store = this.getStore();
          if (this.companyType == 'my') {
            if (search_params) {
              var sp;
              for (sp in search_params)
                store.setBaseParam(sp, search_params[sp]);
            }
            store.setBaseParam('query', query);
            store.setBaseParam('start', 0);
            store.setBaseParam('limit', 25);
          }
          store.load();
        }
      },
      getAt: function(rowIndex) {
        return this.getStore().getAt(rowIndex);
      }
    }
    );
    Application.components.ApplicGrid.superclass.initComponent.call(this);
  }
});
