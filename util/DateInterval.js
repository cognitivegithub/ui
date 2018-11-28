
Ext.ns('Ext.ux.form');

/**
 * @class Ext.ux.form.DateInterval
 * @extends Ext.form.CompositeField
 * Creates a panel with two date fields marking start and end of the period.
 * @xtype dateInterval
 */
Ext.define('Ext.ux.form.DateInterval', {
  extend: 'Ext.form.CompositeField',
  label_from: 'с:',
  label_till: 'по:',
  format: 'd.m.Y',
  cmp_id: 'interval',
  //fieldLabel    : 'Date Range',
  msgTarget: 'side',
  defaults: {
      flex: 1
  },

  initComponent : function () {
    var component = this;
    this.items = [{
      xtype: 'displayfield',
      width: 30,
      value: this.label_from
    }, {
      xtype: 'datefield',
      format: this.format,
      ref: 'from',
      name: this.cmp_id + '_from',
      id: this.cmp_id + '_from_id',
      listeners: {
          select: function(element, value) {
              Ext.getCmp(component.cmp_id + '_till_id').setMinValue(value);
              component.fireEvent('select', value);
          }
      }
    }, {
      xtype: 'displayfield',
      width: 30,
      style: {
        textAlign: 'right'
      },
      value: this.label_till
    }, {
      xtype: 'datefield',
      format: this.format,
      ref: 'till',
      name: this.cmp_id + '_till',
      id: this.cmp_id + '_till_id',
      listeners: {
          select: function(element, value) {
              Ext.getCmp(component.cmp_id + '_from_id').setMaxValue(value);
              component.fireEvent('select', value);
          }
      }
    }];

    this.getValue = function() {
        var date_array = {
            date_from: Ext.getCmp(this.cmp_id + '_from_id').getValue(),
            date_till: Ext.getCmp(this.cmp_id + '_till_id').getValue(),
            id: this.db_id,
            number: this.number
        };
//        if (date_array.date_from == '' || date_array.date_till == '')return null;
        return date_array;
    };

    
    this.setValue = function(date_from, date_till, db_id) {
        Ext.getCmp(this.cmp_id + '_from_id').setValue(date_from);
        Ext.getCmp(this.cmp_id + '_till_id').setValue(date_till);
        this.db_id = db_id;
    }

    Ext.ux.form.DateInterval.superclass.initComponent.call(this);
  } // initComponent

}); // Ext.ux.form.DateInterval

Ext.reg('dateinterval', Ext.ux.form.DateInterval);

// Backwards compat.
Ext.form.DateInterval = Ext.ux.form.DateInterval;






 /**
  * @deprecated Фуфло нерабочее.

Ext.ux.form.DateInterval = Ext.extend(Ext.Panel,  {
  label_from: 'С',
  label_till: 'по',
  cmp_id: 'interval',
  initComponent : function () {
    Ext.apply(this, {
      layout: 'column',
      border: false,
      defaults:{
        layout:'form',
        border:false,
        xtype:'panel'
      },
      items:[
      {
        columnWidth:0.5,
        items:[
          {
            xtype: 'datefield',
            anchor: '100%',
            format: 'd.m.Y',
            name: this.cmp_id+'_from',
            ref: this.cmp_id+'_from',
            fieldLabel: this.label_from
          }
        ]
      },{
          columnWidth:0.5,
          items:[
          {
            xtype: 'datefield',
            anchor: '100%',
            format: 'd.m.Y',
            name: this.cmp_id+'_till',
            ref: this.cmp_id+'_till',
            fieldLabel: this.label_till,
            labelStyle: 'text-align: right;'
          }]
      }
      ]
    });
    Ext.ux.form.DateInterval.superclass.initComponent.call(this);
  }
});

Ext.reg('dateinterval', Ext.ux.form.DateInterval);

// backwards compat
Ext.form.DateInterval = Ext.ux.form.DateInterval;

*/