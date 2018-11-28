
Ext.define('Application.components.addressForm', {
  extend: 'Ext.Panel',
  autoHeight: true,
  initComponent: function() {
    var component = this;
    //var delivery_n = 1;
    var delivery_place = {
      name: 'lot_delivery_places[]',
      layout: 'form',
      labelWidth: 300,
      defaults: {
        allowBlank: false,
        anchor: '100%'
      },
      style: 'margin-bottom: 0; margin-top: 4px',
      items: [
      {
        xtype: 'fieldset',
        title: 'Адрес местонахождения товара',
        items:[
        {
          xtype: 'Application.components.addressPanel',
          name: 'address'
        }]
      }]
    };
    Ext.apply(this, {
      defaults: {
        anchor: '100%',
        defaults: {
          xtype: 'fieldset',
          anchor: '100%'
        }
      },
      layout: 'anchor',
      bodyCssClass: 'subpanel',
      items: [
        delivery_place
      ],
      getValues: function() {
        var v = {};
        if (this.delivery_place_id /* && this.stage>0 */) {
          v.id = this.delivery_place_id;
        }
        collectComponentValues(this, v, true);
        return v;
      },
      setValues: function(v) {
        this.delivery_place_id = v.id;
        setComponentValues(this, v, true);
      }
    });
    Application.components.addressForm.superclass.initComponent.call(this);
    if (this.value && this.value.count) {
      autoSetValue(this);
    } 
  }
});
