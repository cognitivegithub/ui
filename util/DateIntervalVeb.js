
Ext.ns('Ext.ux.form');

/**
 * @class Ext.ux.form.DateIntervalVeb
 * @extends Ext.form.CompositeField
 * Creates a panel with two date fields marking start and end of the period.
 * @xtype dateIntervalVeb
 */
Ext.define('Ext.ux.form.DateIntervalVeb', {
  extend: 'Ext.form.CompositeField',
  label_from: 'с',
  label_from_text: 'с',
  label_till: 'по',
  label_till_text: 'по',
  format: 'd.m.Y',
  cmp_id: 'interval',
  //fieldLabel    : 'Date Range',
  msgTarget: 'side',
  is_text: false,
  defaults: {
    flex: 1
  },
  initComponent: function() {
    var component = this;
    this.items = [
      {
        xtype: 'displayfield',
        width: 30,
        value: this.label_from + ':',
        hidden: component.is_text
      }, {
        xtype: 'datefield',
        editable: false,
        format: this.format,
            fieldLabel: this.label_from,
        allowBlank: component.ownerCt.hidden || component.is_text,
        ref: 'from',
        name: this.cmp_id + '_from',
        id: this.cmp_id + '_from_id',
        listeners: {
          select: function(element, value) {
            Ext.getCmp(component.cmp_id + '_till_id').setMinValue(value);
            component.fireEvent('select', value);
          }
        },
        hidden: component.is_text
      }, {
        xtype: 'displayfield',
        width: 30,
        style: {
          textAlign: 'right'
        },
        value: this.label_till + ':',
        hidden: component.is_text
      }, {
        xtype: 'datefield',
        editable: false,
        format: this.format,
            fieldLabel: this.label_till,
        allowBlank: component.ownerCt.hidden || component.is_text,
        ref: 'till',
        name: this.cmp_id + '_till',
        id: this.cmp_id + '_till_id',
        listeners: {
          select: function(element, value) {
            Ext.getCmp(component.cmp_id + '_from_id').setMaxValue(value);
            component.fireEvent('select', value);
          }
        },
        hidden: component.is_text
      },
      {
        xtype: 'displayfield',
        width: 30,
        style: {
          textAlign: 'right'
        },
        value: this.label_from_text + ':',
        hidden: !component.is_text
      },
      {
        xtype: 'textarea',
        ref: 'from_text',
          fieldLabel: this.label_from_text,
        allowBlank: !component.is_text,
        name: this.cmp_id + '_from_text',
        id: this.cmp_id + '_from_text_id',
        style: 'height:30px',
        hidden: !component.is_text
      },
      {
        xtype: 'displayfield',
        width: 30,
        style: {
          textAlign: 'right'
        },
        value: this.label_till_text + ':',
        hidden: !component.is_text
      },
      {
        xtype: 'textarea',
        ref: 'till_text',
          fieldLabel: this.label_till_text,
        allowBlank: !component.is_text,
        name: this.cmp_id + '_till_text',
        id: this.cmp_id + '_till_text_id',
        style: 'height:30px',
        hidden: !component.is_text
      }
    ];

    this.getValue = function() {
      var date_array = {
        date_from: Ext.getCmp(this.cmp_id + '_from_id').getValue(),
        date_till: Ext.getCmp(this.cmp_id + '_till_id').getValue(),
        date_from_text: Ext.getCmp(this.cmp_id + '_from_text_id').getValue(),
        date_till_text: Ext.getCmp(this.cmp_id + '_till_text_id').getValue(),
        id: this.db_id,
        number: this.number
      };
//        if (date_array.date_from == '' || date_array.date_till == '')return null;
      return date_array;
    };


    this.setValue = function(date_from, date_till, date_from_text, date_till_text, db_id) {
      Ext.getCmp(this.cmp_id + '_from_id').setValue(date_from);
      Ext.getCmp(this.cmp_id + '_till_id').setValue(date_till);
      Ext.getCmp(this.cmp_id + '_from_text_id').setValue(date_from_text);
      Ext.getCmp(this.cmp_id + '_till_text_id').setValue(date_till_text);
      this.db_id = db_id;
    }

    this.validateValues = function() {
      if (!this.is_text) {
        return Ext.getCmp(this.cmp_id + '_from_id').validate() &&
            Ext.getCmp(this.cmp_id + '_till_id').validate();
      } else {
        return Ext.getCmp(this.cmp_id + '_from_text_id').validate() &&
            Ext.getCmp(this.cmp_id + '_till_text_id').validate();
      }
    };

    this.onPhaseFulFillmentChange = function(phaseFulfillmentChecked) {
      if (phaseFulfillmentChecked) {
          Ext.getCmp(this.cmp_id + '_from_id').allowBlank = !!this.is_text;
          Ext.getCmp(this.cmp_id + '_till_id').allowBlank = !!this.is_text;
          Ext.getCmp(this.cmp_id + '_from_text_id').allowBlank = !this.is_text;
          Ext.getCmp(this.cmp_id + '_till_text_id').allowBlank = !this.is_text;
      } else {
          Ext.getCmp(this.cmp_id + '_from_id').allowBlank = true;
          Ext.getCmp(this.cmp_id + '_till_id').allowBlank = true;
          Ext.getCmp(this.cmp_id + '_from_text_id').allowBlank = true;
          Ext.getCmp(this.cmp_id + '_till_text_id').allowBlank = true;
      }
    };

    Ext.ux.form.DateIntervalVeb.superclass.initComponent.call(this);
  } // initComponent

}); // Ext.ux.form.DateIntervalVeb

Ext.reg('dateintervalveb', Ext.ux.form.DateIntervalVeb);

// Backwards compat.
Ext.form.DateIntervalVeb = Ext.ux.form.DateIntervalVeb;
