
Ext.define('Application.components.deliveryForm', {
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
      style: 'margin-bottom: 0; padding-top: 6px; padding-bottom: 0px;',
      items: [{
        fieldLabel: 'Объем поставки',
        allowBlank: true,
        border: false,
        //hidden: true,
        html: ''
      }, {
        xtype: 'textarea',
        height: 50,
        hideLabel: true,
        //hidden: true,
        allowBlank: true,
        name: 'quantity'
      }, {
        fieldLabel: 'Условия, сроки поставки и оплаты',
        allowBlank: true,
        border: false,
        html: ''
      }, {
        xtype: 'textarea',
        height: 50,
        hideLabel: true,
        allowBlank: true,
        name: 'term'
      }, {
        fieldLabel: 'Место поставки товара / выполнения работ / оказания услуг',
        allowBlank: true,
        border: false,
        html: ''
      }, {
        hideLabel: true,
        border: false,
        xtype: 'textarea',
        height: 50,
        allowBlank: true,
        //xtype: 'Application.components.addressPanel',
        name: 'address'
      }],
      buttons: [{
        hidden: true,
        text: 'Удалить место поставки',
        handler: function() {
          var cmp = this.findParentByType('fieldset');
          component.remove(cmp);
          component.doLayout();
        }
      }],
      getValues: function() {
        var v = {};
        if (this.delivery_place_id /* && this.stage>0 */) {
          v.id = this.delivery_place_id;
        }
        collectComponentValues(this, v, true);
        return v;
      }
    }
    Ext.apply(this, {
      defaults: {
        anchor: '100%',
        defaults: {
          xtype: 'fieldset',
          anchor: '100%'
        }
      },
      layout: 'anchor',
      bodyCssClass: 'subpanel-top-padding',
      items: [],
      buttons: [{
        hidden: true,
        text: 'Добавить место поставки',
        handler: function() {
          component.addDeliveryPlace();
        }
      }],
      addDeliveryPlace: function(place, nolayout) {
        var p = new Ext.form.FieldSet(delivery_place);
        if (place) {
          p.delivery_place_id = place.id;
          setComponentValues(p, place, true);
        }
        component.add(p);
        if (!nolayout) {
          component.doLayout();
        }
      },
      setValues: function(v) {
        this.items.each(function(c){
          component.remove(c);
        });
        /*if (v.length>1) {
          delivery_place.buttons[0].hidden = false;
        }*/
        for (var i=0; i<v.length; i++) {
          this.addDeliveryPlace(v[i], true);
        }
        this.doLayout();
      }
    });
    Application.components.deliveryForm.superclass.initComponent.call(this);
    if (this.value && this.value.count) {
      autoSetValue(this);
    } else {
      this.on('beforerender', function(){
        if (0==this.items.length) {
          this.addDeliveryPlace();
        }
      }, this, {once: true});
    }
  }
});
