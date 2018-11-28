Ext.define('Application.components.TsnApplic', {
  extend: 'Ext.form.FormPanel',
  frame: true,
  border: false,

  application_id: null,
  procedure_id: null,
  lot_id: null,

  lot: {
    fields: {
      name: 'Наименование лота:',
      available_quantity: 'Количество товара:',
      okei_id: 'Единица количества товара:',
      price: 'Стоимость за единицу:'
    }
  },

  initComponent: function() {
    this.addEvents('procloaded');
    this.addEvents('applicloaded');
    this.addEvents('appliclistloaded');

    this.lot_panel_id = Ext.id();

    Ext.apply(this, {
      monitorValid : true,
      items: [
        {
          xtype: 'fieldset',
          title: 'Данные лота',
          items: {
            xtype: 'Application.components.keyValuePanel',
            id: this.lot_panel_id,
            cellCls: null,
            autoHeight: true,
            border: false,
            style: 'margin: 0px; padding: 0px;',
            fields: this.lot.fields,
            templates: this.lot.templates
          }
        }
      ]
    });

    Application.components.TsnApplic.superclass.initComponent.call(this);

    this.on('procloaded', function(procedure) {
      this.setProcedureValues(procedure);
      this.procedure = procedure;
    });
    this.on('applicloaded', function(applic) {
      var clean = function(obj) {
        for (var property in obj)
          if (Ext.isEmpty(obj[property]))
            delete obj[property];
        return obj;
      };
      this.getForm().setValues(clean(applic));
      this.setProcedureValues(applic.procedure);
      this.application_id = applic.id;
    });
  },

  setProcedureValues: function(procedure) {
    var lotPanel = Ext.getCmp(this.lot_panel_id);
    lotPanel.templates.available_quantity = function(value) {
      return this.isFloat(procedure) ? Ext.util.Format.number(value, '0.00') : Ext.util.Format.number(value, '0');
    }.createDelegate(this);
    lotPanel.templates.price = function(value) {
      return Ext.util.Format.formatPrice(value) + ' ' + procedure.currency_vocab_short;
    };
    lotPanel.setValues(procedure);
  },

  getValues: function() {
    var values = {
      procedure_id: this.procedure_id
    };
    collectComponentValues(this, values);
    if (this.application_id) {
      values.id = this.application_id;
    }
    return values;
  },

  isFixprice: function(procedure) {
    return procedure.procedure_type == 2;
  },

  isAuction: function(procedure) {
    return procedure.procedure_type == 1;
  },

  isFloat: function(procedure) {
    return procedure.okei_id != 'Штука';
  },

  performSave: function(cb) {
    performRPCCall(RPC_tsn.Applic.save, [this.getValues()], null, function(result) {
      if (result.success) {
        if (result.applic) {
          this.application_id = result.applic.id;
        }
        if (cb) {
          cb(result);
        }
      } else {
        echoResponseMessage(result);
      }
    }.createDelegate(this));
  },

  loadProcedureData: function(procedure_id) {
    Ext.getBody().mask('Загружаем данные');
    performRPCCall(RPC_tsn.Procedure.load, [procedure_id], null, function(resp) {
      if (resp && resp.success) {
        if (resp.procedure) {
          this.fireEvent('procloaded', resp.procedure);
        }
      } else {
        if (resp) {
          echoResponseMessage(resp);
        }
      }
      Ext.getBody().unmask();
    }.createDelegate(this));
  },

  loadApplicationData: function(application_id, supplier_id) {
    var values = {
      procedure_id: this.procedure_id,
      application_id: application_id,
      supplier_id: supplier_id
    };
    Ext.getBody().mask('Загружаем данные');
    performRPCCall(RPC_tsn.Applic.loaddraft, [values], null, function(resp) {
      if (resp && resp.success) {
        if (resp.applic) {
          this.fireEvent('applicloaded', resp.applic);
        }
      } else {
        if (resp) {
          echoResponseMessage(resp);
        }
      }
      Ext.getBody().unmask();
    }.createDelegate(this));
  }
});
