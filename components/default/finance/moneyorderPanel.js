
Ext.define('Application.components.moneyorderPanel', {
  extend: 'Ext.tab.Panel',
  initComponent: function() {
    var component = this;

    var form_panel_id = Ext.id();
    var grid_panel_id = Ext.id();
    var generate_form_id = Ext.id();

    Ext.apply(this, {
      id: form_panel_id,
      activeTab: 0,
      frame: true,
      defaults: {
        layout        : 'vbox',
        bodyCssClass: 'subpanel-top-padding',
        frame: true,
        border: false,
        layoutConfig  : {
          align       : 'stretch',
          pack        : 'start'
        }
      },
      items: [{
        title: 'Заявки на возврат',
        items: [{
          xtype: 'Application.components.moneybackGrid',
          flex: 1,
          autoHeight: false
        }]
      }, {
        title: 'Исполнение заявок',
        items: [{
          xtype: 'fieldset',
          title: 'Генерация платежных документов',
          autoHeight: true,
          items: [{
            xtype: 'Application.components.orderGenerateForm',
            parent: component,
            id: generate_form_id
          }]
        }, {
          xtype: 'Application.components.moneyorderGrid',
          parent: component,
          flex: 1,
          title: 'Заявки на возврат',
          id: grid_panel_id
        }],
        listeners: {
          beforerender: function() {
            Ext.getCmp(grid_panel_id).relayEvents(Ext.getCmp(generate_form_id), ['search_started']);
          }
        }
      }]
    });
    Application.components.moneyorderPanel.superclass.initComponent.call(this);
  }
});
/*Ext.define('Application.components.moneybacklistPanel', {
  extend: 'Ext.Panel',
  frame: true,
  initComponent: function() {
  var component = this;
  var app_panel_id = Ext.id();
  var form_panel_id = Ext.id();
  var grid_panel_id = Ext.id();

  submitPaymentForm = function(form) {
    form.form.submit({
      success: function (form, action) {
        Ext.getCmp('paydocs_window').close();
      },
      failure: failureHandler
    });
  };

  VARS = {
    total_sum: new Array(),
    stop_check: false,
    all_done: false
  };

  fireGridEvent = function(event) {
    var cmp = Ext.getCmp(grid_panel_id);
    if (cmp) {
      cmp.fireEvent(event);
    }
  };

  updateSuppliers = function() {
    if (VARS.stop_check) {
      return false;
    }
    var grid = Ext.getCmp('paydocs_grid');
    if (!grid) {
      fireGridEvent('check_fail');
      return;
    }
    var store = grid.getStore();
    var n = store.find('checker', /^$/);
    if (n<0) {
      VARS.all_done = true;
      fireGridEvent('check_done');
      return;
    }
    var record = store.getAt(n);
    var id = record.data.supplier_id;
    var appid = record.data.id;
    var sum = record.data.sum;

    var tsum = 0;
    if (VARS.total_sum[id]) {
      tsum = VARS.total_sum[id];
      VARS.total_sum[id] += sum;
    } else {
      VARS.total_sum[id] = sum;
    }

    record.data.checker = WAITING;
    record.data.message = WAITING+' Обрабатывается...';
    store.fireEvent('update', store, record, Ext.data.Record.EDIT);
    $.ajax({
      url: '/admin/docs/checksupplier/id/'+id+'/sum/'+sum+'/tsum/'+tsum,
      method: 'GET',
      success: function(data, status) {
        if (!data) {
          fireGridEvent('check_fail');
          return false;
        }
        record.data.message = data.msg;
        //$('#status'+appid).html(data.msg)
        var checked=!!data.result;
        var disabled = !checked;
        if (checked && record.data.date_accepted) {
          checked = false;
        }
        record.data.checker = '<input type="checkbox"'+(checked?' checked="checked"':'')+(disabled?' disabled="disabled"':'')+' '+' name="supplier[]" value="'+id+':'+appid+'" />';
        //$('#check'+appid).html('<input type="checkbox" '+(checked?'checked="checked"':'disabled="disabled"')+' '+' name="supplier[]" value="'+id+':'+appid+'" />');
        store.fireEvent('update', store, record, Ext.data.Record.EDIT);
        updateSuppliers.defer(500);
      },
      dataType: 'json'
    });
  };

  makePaymentDocs=function(from, till, inn) {
    var datapanel = new Ext.FormPanel({
      width: '100%',
      border: false,
      frame: true,
      standardSubmit: true,
      url: '',
      id: 'paydocs_form',
      layout: 'fit',
      items: [{
        id: 'waitbox',
        bodyStyle: 'text-align: center; padding: 40px 10px 10px 10px;',
        html: WAITING+' Пожалуйста подождите...'
      }]
    });
    var w = new Ext.Window({
      //autoHeight: true,
      width: '50%',
      height: 150,
      title: 'Генерация платежных документов',
      closeAction: 'close',
      id: 'paydocs_window',
      modal: true,
      layout: 'fit',
      stateful: false,
      boxMinHeight: 150,
      boxMinWidth: 500,
      constrain: true,
      items: [
        datapanel
      ]
    });
    var dstore = new Ext.data.JsonStore({
      root: 'requests',
      idProperty: 'id',
      totalProperty: 'totalCount',
      remoteSort: false,
      autoLoad: true,
      url: '',
      fields: ['id', 'checker', 'supplier_id', 'date_added', 'sum', 'full_name',
               'inn', 'kpp', 'acct_lic', 'balance', 'message', 'date_accepted'],
      baseParams: {
        'from': from,
        'till': till,
        'inn': inn
      },
      listeners: {
        load: function(self, records, options) {
          var datagrid = new Ext.grid.GridPanel({
            store: dstore,
            id: 'paydocs_grid',
            title: 'Данные по заявкам',
            columns: [
              {header: "#", dataIndex: 'id', sortable: true, width: 10},
              {header: "!", dataIndex: 'checker', sortable: true, width: 10},
              {header: "Наименование", dataIndex: 'full_name', sortable: true},
              {header: "ИНН", dataIndex: 'inn', sortable: true, width: 40},
              {header: "КПП", dataIndex: 'kpp', sortable: true, width: 40},
              {header: "Дата добавления", dataIndex: 'date_added', sortable: true, width: 55},
              {header: "Сумма (руб.)", dataIndex: 'sum', sortable: true, width: 55, renderer: 'formatPrice'},
              {header: "Своб. остаток (руб.)", dataIndex: 'balance', sortable: true, width: 55, renderer: 'formatPrice'},
              {header: "Готовность", dataIndex: 'message', sortable: false}
            ],
            viewConfig: {
              enableRowBody: false,
              showPreview: false,
              forceFit: true,
              getRowClass: function(record, rowIndex, p, store) {
                return record.data.date_accepted?'x-color-3':null;
              }
            },
            bbar: [{
              xtype: 'button',
              text: 'Выбрать все',
              handler: function() {
                $('#paydocs_form :checkbox:enabled').attr('checked', 'checked');
              }
            }, '-', {
              xtype: 'button',
              text: 'Снять выделение',
              handler: function() {
                $('#paydocs_form :checkbox').removeAttr('checked');
              }
            },
            '->',
            {
              xtype: 'panel',
              id: 'check_status',
              style: 'margin: 0 3px;',
              html: '<img src="/resources/ext/resources/images/loading.gif" />'
            }, '-',
            {
              xtype: 'button',
              text: 'Остановить проверку',
              id: 'stop_check',
              handler: function() {
                VARS.stop_check = true;
                fireGridEvent('check_stop');
              }
            }, '-', {
              xtype: 'button',
              disabled: true,
              id: 'resume_check',
              text: 'Продолжить проверку',
              handler: function() {
                VARS.stop_check = false;
                fireGridEvent('check_resume');
                updateSuppliers.defer(300);
              }
            }
            ],
            buttonAlign: 'left',
            buttons: [
            {
              text: 'Сгенерировать документ',
              handler: function(){submitPaymentForm(Ext.getCmp('paydocs_form'));}
            },
            {
              text: 'Отмена',
              handler: function(){Ext.getCmp('paydocs_window').close();}
            }],
            listeners: {
              'check_done': function() {
                $('#check_status').html('<img src="/resources/ext/resources/images/check.gif" />');
                Ext.getCmp('resume_check').setDisabled(true);
                Ext.getCmp('stop_check').setDisabled(true);
              },
              'check_fail': function() {
                $('#check_status').html('<img src="/resources/ext/resources/images/failed.gif" />');
                Ext.getCmp('resume_check').setDisabled(false);
                Ext.getCmp('stop_check').setDisabled(true);
              },
              'check_stop': function() {
                $('#check_status').html('<img src="/resources/ext/resources/images/file-remove.gif" />');
                Ext.getCmp('resume_check').setDisabled(false);
                Ext.getCmp('stop_check').setDisabled(true);
              },
              'check_resume': function() {
                $('#check_status').html('<img src="/resources/ext/resources/images/loading.gif" />');
                Ext.getCmp('resume_check').setDisabled(true);
                Ext.getCmp('stop_check').setDisabled(false);
              }
            }
          });
          datapanel.removeAll(true);
          datapanel.add(datagrid);
          datapanel.add({
                xtype: 'hidden',
                name: 'do',
                value: 'make'
              });
          var height=$(window).height()*0.9;
          var width=$(window).width()*0.95;
          var w=Ext.getCmp('paydocs_window');
          w.setHeight(height);
          w.setWidth(width);
          w.doLayout();
          w.center();
          VARS.total_sum = new Array();
          VARS.stop_check = false;
          VARS.all_done = false;
          fireGridEvent('check_resume');
          updateSuppliers.defer(300);
        },
        exception: function(data) {
          Ext.MessageBox.alert('Ошибка', data, function(){Ext.getCmp('paydocs_window').close();});
        }
      }
    });
    w.show();
    w.center();
  };

  function getFormParameters() {
    return collectComponentValues(form_panel_id);
  }

  var store = new Ext.data.JsonStore({
      root: 'requests',
      idProperty: 'id',
      totalProperty: 'totalCount',
      remoteSort: true,
      proxy: new Ext.data.HttpProxy({url: 'finance/moneyback'}),
      fields: ['id', 'contragent_id', {name: 'date_added', type: 'date', dateFormat: 'Y-m-d H:i:s'}, {name: 'date_solved', type: 'date', dateFormat: 'Y-m-d H:i:s'}, {name: 'date_cancelled', type: 'date', dateFormat: 'Y-m-d H:i:s'}, 'cancel_reason', 'sum', 'full_name', 'inn', 'date_accepted'],
      listeners: {
      beforeload: function() {
        this.baseParams = getFormParameters();
      }
    },
    autoLoad: false
  });
  store.setDefaultSort('date_added', 'desc');

  function renderOperationLinks(value, p, record) {
    var sResult = '<a href="/admin/docs/moneyback/do/printorder/id/'+record.data.id+'" title="Платежное поручение"><img src="/ico/appl_dover.png"/></a>';
    if (!record.data.date_solved) {
      sResult += ' <a href="/admin/docs/moneyback/do/charge/id/'+record.data.id+'" title="Возврат произведен"><img src="/ico/contract.png"/></a>';
      sResult += ' <a href="/admin/docs/moneyback/do/refuse/id/'+record.data.id+'" title="Отклонить заявку"><img src="/ico/garbage.png"/></a>';
    }
    sResult += ' <a href="/admin/syslog/eds/req/'+record.data.id+'" title="Сертификат ЭП"><img src="/ico/eds.png"/></a>';
      return sResult;
  }

  var dataGrid = new Ext.grid.GridPanel({
      store: store,
      title: 'Заявки на возврат средств со счетов участников',
      columns: [
      {header: "#", dataIndex: 'id', sortable: true, width: 20},
        {header: "Наименование", tooltip: "Наименование", dataIndex: 'full_name', sortable: true, renderer: function(v,m,r){
        return '<a href="/admin/supplier/corrector/id/'+r.data.supplier_id+'">'+Ext.util.Format.htmlEncode(v)+'</a>';
      }},
      {header: "ИНН", tooltip: "ИНН", dataIndex: 'inn', sortable: true, width: 35},
          {header: "Дата добавления", tooltip: "Дата добавления", dataIndex: 'date_added', sortable: true, width: 35, renderer: Ext.util.Format.dateRenderer('d.m.Y')},
          {header: "Дата обработки", tooltip: "Дата обработки", dataIndex: 'date_solved', sortable: true, width: 35, renderer: Ext.util.Format.dateRenderer('d.m.Y')},
          {header: "Дата отклонения", tooltip: "Дата отклонения", dataIndex: 'date_cancelled', sortable: true, width: 35, renderer: Ext.util.Format.dateRenderer('d.m.Y')},
          {header: "Причина отклонения", tooltip: "Причина отклонения", dataIndex: 'cancel_reason', width: 50, sortable: true},
          {header: "Сумма (руб.)", tooltip: "Сумма (руб.)", dataIndex: 'sum', sortable: true, width: 35, renderer: 'formatPrice'},
          {header: "Операции", tooltip: "Операции", width: 35, sortable: false, renderer: renderOperationLinks}
      ],
      style: 'margin: 10px 15px; text-align: left;',
      autoHeight: true,
      viewConfig: {
        forceFit: true,
        scrollOffset: 2,
        showPreview: false,
        getRowClass: function(record, rowIndex, p, store) {
          return record.data.date_accepted?'x-color-3':null;
        }
      }
  });

var searchForm = new Ext.FormPanel({
  labelWidth: 140,
  frame:false,
  hideTitle: true,
  border: false,
  autoHeight: true,
  defaultType: 'textfield',
  bodyStyle: 'padding: 10px 15px 0 15px',
  style: 'margin: auto; padding: 0px; text-align: left;',
  items:
  [
    new Ext.form.FieldSet({
      title: 'Поиск заявок',
      autoHeight: true,
      defaultType: 'textfield',
      layout: 'column',
      style: 'margin: 10px 15px 0 0',
      defaults:{
        layout:'form',
        border:false,
        xtype:'panel'
      },
      items: [{
		labelWidth: 140,
		bodyStyle:'padding:1px 18px 0 0',
		columnWidth:0.4,
		items:[
          {
			xtype:'textfield',
			name: 'supplier_name',
			id: 'supplier_name',
			fieldLabel: '<b>ФИО поставщика</b>',
			anchor: '100%',
            stateId: 'admin_docs_moneyback_supplier_name',
            stateEvents: ['change'],
            stateful: true,
            getState: function() {
              return {value:this.getValue()}
            }
          }, {
            xtype:'textfield',
            name: 'request_id',
            id: 'request_id',
            fieldLabel: '<b>Номер заявки</b>',
            anchor: '100%'
          }, {
            xtype:'textfield',
            name: 'supplier_inn',
            id: 'supplier_inn',
            fieldLabel: '<b>ИНН поставщика</b>',
            anchor: '100%',
            stateId: 'admin_docs_moneyback_supplier_inn',
            stateEvents: ['change'],
            stateful: true,
            getState: function() {
              return {value:this.getValue()}
            }
          }, {
            xtype:'textfield',
            name: 'supplier_kpp',
            id: 'supplier_kpp',
            fieldLabel: '<b>КПП поставщика</b>',
            anchor: '100%',
            stateId: 'admin_docs_moneyback_supplier_kpp',
            stateEvents: ['change'],
            stateful: true,
            getState: function() {
              return {value:this.getValue()}
            }
          }, {
            xtype: 'button',
            text: 'Искать',
            style: 'margin-top: 15px',
            type: 'submit',
            handler: function() {
                store.load({params: merge({start: 0, limit: 25}, getFormParameters())});
            }
        }]
      }, {
      columnWidth:0.6,
      items:[{
          layout: 'column',
          border: false,
          defaults: {
              layout: 'form',
              border: false,
              xtype:'panel'
          },
          items: [{
              columnWidth:0.45,
              items:[{
                  xtype: 'datefield',
                  anchor: '100%',
                  name: 'start_from',
                  id: 'start_from',
                  format: 'd.m.Y',
                  fieldLabel: '<b>Дата заявки с</b>',
                  stateId: 'admin_docs_moneyback_start_from',
                  stateEvents: ['change'],
                  stateful: true,
                  getState: function() {
                    return {value:this.getValue()}
                  }
              }]
          },{
              columnWidth:0.3,
              labelWidth: 35,
              items:[{
                  xtype: 'datefield',
                  anchor: '100%',
                  name: 'start_till',
                  id: 'start_till',
                  format: 'd.m.Y',
                  fieldLabel: '<b>по</b>',
                  labelStyle: 'text-align: right;',
                  stateId: 'admin_docs_moneyback_start_till',
                  stateEvents: ['change'],
                  stateful: true,
                  getState: function() {
                    return {value:this.getValue()}
                  }
                }]
            }]
        }, {
            layout: 'column',
            border: false,
            defaults: {
                layout:'form',
                border:false,
                xtype:'panel'
            },
            items:[{
                columnWidth:0.45,
                items: [{
                  xtype: 'textfield',
                  anchor: '100%',
                  style: 'margin-top: 2px',
                  name: 'sum_min',
                  id: 'sum_min',
                  fieldLabel: '<b>Сумма на вывод от</b>',
                  stateId: 'admin_docs_moneyback_sum_min',
                  stateEvents: ['change'],
                  stateful: true,
                  getState: function() {
                    return {value:this.getValue()}
                  }
              }]
          }, {
              labelWidth: 35,
              columnWidth:0.3,
              items: [{
                  xtype: 'textfield',
                  anchor: '100%',
                  style: 'margin-top: 2px',
                  name: 'sum_max',
                  id: 'sum_max',
                  fieldLabel: '<b>до</b>',
                  labelStyle: 'text-align: right;',
                  stateId: 'admin_docs_moneyback_sum_max',
                  stateEvents: ['change'],
                  stateful: true,
                  getState: function() {
                    return {value:this.getValue()}
                  }
                }]
            }]
          }, {
            xtype:'textfield',
            name: 'supplier_acct_lic',
            id: 'supplier_acct_lic',
            fieldLabel: '<b>Лицевой счет</b>',
            anchor: '100%',
            stateId: 'admin_docs_moneyback_supplier_acct_lic',
            stateEvents: ['change'],
            stateful: true,
            getState: function() {
              return {value:this.getValue()}
            }
          }]
		}
      ]
    })
  ]
});

var billForm = new Ext.FormPanel({
  labelWidth: 140,
  frame:false,
  title: 'Генерация платежных документов для 1С',
  border: true,
  autoHeight: true,
  style: 'margin: 10px 15px;',
  bodyStyle: 'padding: 10px;',
  defaults: {
    border: false,
    frame: false
  },
  items: [
    renderDateField('<b>Заявки с</b>', 'date_from', true, false),
    renderDateField('<b>по</b>', 'date_till', true, false),
    new Ext.form.NumberField({
      id: 'inn_paydocs',
      fieldLabel: '<b>ИНН</b>',
      width: 100
    }),
  {
    layout: 'table',
    width: 550,
    items: [
  {
    xtype: 'button',
    type: 'submit',
    text: 'Сгенерировать платежные документы',
    handler: function(){makePaymentDocs($('#date_from').val(), $('#date_till').val(), $('#inn_paydocs').val());}
  }, {
    xtype: 'button',
    text: 'Отметить платежные поручения отданные в исполнение',
    handler: function(){
      var win = new Ext.Window({
        autoHeight: true,
        width: 600,
        closeAction: 'close',
        modal: true,
        title: 'Обработка платежных поручений',
        items: [{
          width: '100%',
          border: false,
          autoheight: true,
          frame: true,
          fileUpload: true,
          xtype: 'form',
          labelWidth: 150,
          items: [
            new Ext.form.FileUploadField({
              buttonText: 'Обзор...',
              name: 'file',
              style: 'margin-top: 2px; margin-bottom: 2px;',
              allowBlank: false,
              fieldLabel: 'Файл'
            }),
            {
              html: "Загрузите файл с платежными поручениями, который отдан на исполнение в банк-клиент"
            },
            {
              xtype: 'hidden',
              name: 'do',
              value: 'mark'
            }
          ],
          buttons: [
            {
              text: 'Загрузить',
              handler: function() {
                var form = win.getComponent(0);
                form = form.getForm();
                if (form.isValid()) {
                  form.submit({
                    url: '/admin/docs/moneybackauto',
                    waitMsg: "Загружаем файл...",
                    success: function (form, action) {
                      var result = Ext.decode(action.response.responseText);
                      echoResponseMessage(result, function(){
                        if (result.success) {
                          win.close();
                        }
                      });
                    },
                    failure: failureHandler
                  });
                }
              }
            },
            {
              text: 'Отмена',
              handler: function() {
                win.close();
              }
            }
          ]
        }]
      });
      win.show();
    }
  }]
  }]
});

  Ext.apply(this, {
    id: app_panel_id,
    enableTabScroll:false,
    border: false,
    defaults: {
      border: false,
      frame: true
    },
    autoHeight: true,
    items: [
      searchForm,
      billForm,
      dataGrid
    ]
  });
  Application.components.moneybacklistPanel.superclass.initComponent.call(this);
  }
});*/