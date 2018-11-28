/**
 * @deprecated
 */
Ext.define('Application.components.lotForm', {
  extend: 'Ext.panel.Panel',
  autoHeight: true,
  parent: null,
  frame: true,
  lotNumber: 1,
  initComponent: function() {
    var component = this;
    this.ids = {
      docs: Ext.id(),
      delivery: Ext.id(),
      subject: Ext.id(),
      reqs: Ext.id()
    };

    var subject = new Application.components.subjectForm({
      title: 'Сведения о товаре',
      id: this.ids.subject,
      value: this.value
    });

    var reqs = new Application.components.reqForm({
      title: 'Требования к покупателям и критерии оценки',
      id: this.ids.reqs,
      value: this.value
    });

    addEvents(this, ['procedurechanged', 'stageschanged', 'startpricechanged','onEditing']);

    Ext.apply(this, {
      items: [{
        xtype: 'tabpanel',
        activeTab: 0,
        cls: 'deepsubpanel',
        border: true,
        header: true,
        defaults: {
          frame: true
        },
        items: [subject, {
          title: 'Адрес местонахождения товара',
          xtype: 'Application.components.addressForm',
          value: this.value?this.value.lot_delivery_places:null,
          id: this.ids.delivery
        }, reqs, {
          title: 'Проект договора',
          name: 'lot_documentation',
          id: this.ids.docs,
          procedure: this.parent,
          xtype: 'Application.components.lotdocForm'
        }]
      }],
      listeners: {
        procedurechanged: function(p) {
          //alert('Процедура стала '+p);
        }
      },
      getValues: function() {
        var v = {number: this.lotNumber};
        if (this.lot_id) {
          v.id = this.lot_id;
        }

        collectComponentValues(this, v);
        
        return v;
      },
      setValues: function(v) {
        setComponentValues(this, v, true);
        if (v.lot_delivery_places) {
          Ext.getCmp(this.ids.delivery).setValues(v.lot_delivery_places);
        }
        if (v.id) {
          this.lot_id = v.id;
        }
        Ext.getCmp(this.ids.subject).setValues(v);
        Ext.getCmp(this.ids.reqs).setValues(v);
      }
    });
    Application.components.lotForm.superclass.initComponent.call(this);
    autoSetValue(this);
    subject.relayEvents(this, ['procedurechanged','onEditing']);
    reqs.relayEvents(this, ['procedurechanged']);
  },
  validate: function() {
    var valid = {success: true, msg: []};
    var docs = {};
    collectComponentValues(Ext.getCmp(this.ids.docs), docs);
    if (!docs.lot_documentation || !docs.lot_documentation.length) {
      valid.msg.push('У лота отсутствует документация.');
      valid.success = false;
    }
    valid.msg = valid.msg.join('<br/>\n');
    return valid;
  }
});
