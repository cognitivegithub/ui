/**
 * Параметры компоненты:
 * parent - родительская панель
 */

 Ext.define('Application.components.moneyorderGrid', {
  extend: 'Ext.grid.Panel',
  frame : false,
  border : true,
  initComponent : function () {
    var component = this;
    this.addEvents('search_started');

    var dstore = new Ext.data.DirectStore({
      root: 'requests',
      idProperty: 'id',
      totalProperty: 'totalCount',
      remoteSort: false,
      autoLoad: false,
      directFn: RPC.Finance.moneyorderlist,
      paramsAsHash: true,
      fields: ['id', 'checker', 'contragent_id', {name:'date_added', type: 'date', dateFormat: 'c'}, 'sum', 'full_name',
               'inn', 'kpp', 'acct_lic', 'balance', 'message', 'date_accepted'],
      baseParams : component.parent.generateParams,
      listeners: {
        loadexception: storeExceptionHandler
      }
    });

    component.total_sum = new Array();
    component.stop_check = false;
    component.all_done = false;

    var selectionModel = new Ext.grid.CheckboxSelectionModel({
      singleSelect:false,
      checkonly: true
    });

    Ext.apply(this,
    {
      style: 'padding-top: 12px; padding-bottom: 5px;',
      store: dstore,
      columns: [
        selectionModel,
        {header: "Номер заявки", tooltip: "Номер заявки", dataIndex: 'id', sortable: true, width: 10},
        {header: "Результат проверки", tooltip: "Результат проверки", dataIndex: 'checker', sortable: true, width: 10},
        {header: "Наименование", dataIndex: 'full_name', sortable: true},
        {header: "ИНН", dataIndex: 'inn', sortable: true, width: 40},
        {header: "КПП", dataIndex: 'kpp', sortable: true, width: 40},
        {header: "Дата добавления", dataIndex: 'date_added', sortable: true, width: 55, renderer: Ext.util.Format.dateRenderer('d.m.Y H:i')},
        {header: "Сумма (руб.)", dataIndex: 'sum', sortable: true, width: 55, renderer: 'formatPrice'},
        {header: "Своб. остаток (руб.)", dataIndex: 'balance', sortable: true, width: 55, renderer: 'formatPrice'},
        {header: "Готовность", dataIndex: 'message', sortable: false}
      ],
      viewConfig: {
        forceFit: true,
        getRowClass: function(record, rowIndex, p, store) {
          return record.data.date_accepted?'x-color-3':null;
        }
      },
      sm: selectionModel,
      border: false,
      loadMask: true,
      flex: 1,
      autoScroll: true,
      iconCls: 'icon-grid',
      bbar: ['->', {
        xtype: 'panel',
        id: 'check_status',
        style: 'margin: 0 3px;',
        html: '<img src="/css/images/default/grid/loading.gif" />'
      }, '-', {
        xtype: 'button',
        text: 'Остановить проверку',
        id: 'stop_check',
        handler: function() {
          component.stop_check = true;
          component.fireEvent('check_stop');
        }
      }, '-', {
        xtype: 'button',
        disabled: true,
        id: 'resume_check',
        text: 'Продолжить проверку',
        handler: function() {
          component.stop_check = false;
          component.fireEvent('check_resume', component.parent.generateParams);
          component.updateSuppliers.defer(300, component);
        }
      }],
      buttonAlign: 'left',
      buttons: [
      {
        text: 'Сгенерировать документ',
        handler: function(){
          var selected = component.getSelectionModel().getSelections();
          var applics = [];
          for (var i=0; i<selected.length; i++) {
            applics.push(selected[i].id);
          }
          if(applics.length>0) {
            window.location = 'finance/makePaymentDocs/applics/'+escape(applics);
          } else {
            Ext.MessageBox.alert('Не было выбрано ни одной заявки');
          }
        }
      },
      {
        text: 'Отмена',
        handler: function(){
          component.getSelectionModel().clearSelections('silent');
        }
      }],
      listeners: {
        render: function() {
          this.fireEvent('check_resume', {});
        },
        check_done: function() {
          Ext.getCmp('check_status').update('<img src="/images/check.gif" />');
          Ext.getCmp('resume_check').setDisabled(true);
          Ext.getCmp('stop_check').setDisabled(true);
        },
        check_fail: function() {
          Ext.getCmp('check_status').update('<img src="/ico/errors.png" />');
          Ext.getCmp('resume_check').setDisabled(false);
          Ext.getCmp('stop_check').setDisabled(true);
        },
        check_stop: function() {
          Ext.getCmp('check_status').update('<img src="/images/file-remove.gif" />');
          Ext.getCmp('resume_check').setDisabled(false);
          Ext.getCmp('stop_check').setDisabled(true);
        },
        check_resume: function(generate_params) {
          Ext.getCmp('check_status').html = '<img src="/css/images/default/grid/loading.gif" />';
          Ext.getCmp('resume_check').setDisabled(true);
          Ext.getCmp('stop_check').setDisabled(false);
          var cmp = this;
          this.getStore().load({
            params : generate_params,
            callback : function() {
              cmp.total_sum = new Array();
              cmp.stop_check = false;
              cmp.all_done = false;
              cmp.updateSuppliers();
            }
          });
        },
        search_started: function(values) {
          this.fireEvent('check_resume', values);
        }
      }
    }
    );

    Application.components.moneyorderGrid.superclass.initComponent.call(this);
  },
  updateSuppliers : function() {
    if (this.stop_check) {
      return false;
    }
    var grid = this;
    if (!grid) {
      this.fireEvent('check_fail');
      return;
    }
    var store = grid.getStore();
    var n = store.find('checker', /^$/);
    if (n<0) {
      this.all_done = true;
      this.fireEvent('check_done');
      return;
    }
    var record = store.getAt(n);
    var id = record.data.contragent_id;
    var appid = record.data.id;
    var sum = record.data.sum;

    var tsum = 0;
    if (this.total_sum[id]) {
      tsum = this.total_sum[id];
      this.total_sum[id] = tsum+sum;
    } else {
      this.total_sum[id] = sum;
    }

    record.data.checker = WAITING;
    record.data.message = WAITING+' Обрабатывается...';
    store.fireEvent('update', store, record, Ext.data.Record.EDIT);
    var params = {};
    params.contragent_id = id;
    params.tx_sum = sum;
    params.total_sum = tsum;
    performRPCCall(RPC.Finance.checksupplier, [params], {scope: this, monitor_valid: this}, function(resp) {
      if(resp.success===true) {
        var data = resp.conclusion;
        record.data.message = resp.message;

        //record.data.checker = '<input type="checkbox"'+(checked?' checked="checked"':'')+(disabled?' disabled="disabled"':'')+' '+' name="supplier[]" value="'+id+':'+appid+'" />';
        //$('#check'+appid).html('<input type="checkbox" '+(checked?'checked="checked"':'disabled="disabled"')+' '+' name="supplier[]" value="'+id+':'+appid+'" />');

        if (!data) {
          grid.fireEvent('check_fail');
          record.data.checker = '-';
        } else {
          var sm = grid.getSelectionModel();
          sm.selectRecords([record], true);
          record.data.checker = '+';
        }
        store.fireEvent('update', store, record, Ext.data.Record.EDIT);
        this.updateSuppliers.defer(300, this);
      }
    });
  }
});
