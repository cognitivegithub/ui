
Ext.define('Application.components.reqForm', {
  extend: 'Ext.panel.Panel',
  autoHeight: true,
  initComponent: function() {
    var criterium_slider_id = Ext.id(), requirement_fset_id = Ext.id();

    addEvents(this, ['procedurechanged', 'startpricechanged']);

    var criterium_slider = {
      disabled: false,
      fieldLabel: 'Критерии отбора победителей',
      name: 'volume_criterium',
      id: criterium_slider_id,
      qtipConfig: {
        html: 'В данном поле Вы можете выбрать, какой способ продажи подходит именно Вам: если ползунок перемещен влево, '+
          'то при ранжировании предложений приоритет будет отдан покупателю, предложившему наибольшую цену, даже в случае '+
          'если он не готов приобрести весь объем имеющегося товара; если ползунок перемещен вправо, то приоритет будет отдан '+
          'покупателю, который готов приобрести наибольшую часть имеющегося объема.',
        autoHide: false,
        applyTipTo: 'label'
      },
      plugins: [Ext.ux.plugins.ToolTip ],
      minIncrement: 1,
      leftTextValue: 'Объем',
      rightTextValue: 'Цена',
      xtype: 'Application.components.percentSlider'
    };
    
    Ext.apply(this, {
      layout: 'form',
      bodyCssClass: 'subpanel',
      defaults: {
        anchor: '100%'
      },
      labelWidth: 350,
      items: [
      {
        title: 'Требования к покупателям и критерии оценки предложений',
        xtype: 'fieldset',
        id: requirement_fset_id,
        layout: 'form',
        defaults: {
          anchor: '100%'
        },
        labelWidth: 350,
        items: [
        {
          html: 'Требования к покупателям:',
          qtipConfig: {
            html: 'Если у Вас есть специальные требования к потенциальным покупателям, при несоблюдении '+
              'которых их предложение будет отклонено, опишите их в этом поле. Так Вы сэкономите свое '+
              'время и время покупателей.',
            autoHide: false,
            applyTipTo: 'label'
          },
          plugins: [Ext.ux.plugins.ToolTip ],
          hideLabel: true
        }, {
          xtype: 'textarea',
          allowBlank: true,
          hideLabel: true,
          height: 160,
          name: 'buyer_requirements'
        },
        criterium_slider
        ]
      }],
      
      setValues: function(v) {
        setComponentValues(this, v, true);
      }
    });

    this.listeners = this.listeners||{};
    Ext.apply(this.listeners, {
      procedurechanged: function(p) {
        if (Application.models.Tsn_Procedure.type_ids.fix_price == p) {
          Ext.getCmp(criterium_slider_id).setDisabled(true);
          Ext.getCmp(criterium_slider_id).hidden = true;
        } else {
          Ext.getCmp(criterium_slider_id).setDisabled(false);
          Ext.getCmp(criterium_slider_id).hidden = false;
        }
      },
     
      startpricechanged: function(val) {
        /*this.startPrice = val;
        var cmps = [app_guarantee_id, contr_guarantee_id, advance_guarantee_id, advance_guarantee_id, warranty_guarantee_id];
        callComponents(cmps, function(cmp){cmp.updateRanges(0, val);});*/
      },
      activate: function() {
        this.fireEvent('startpricechanged', this.startPrice);
      }
    });

    Application.components.reqForm.superclass.initComponent.call(this);
    autoSetValue(this);
  }
});
