
Ext.define('Application.components.basicForm', {
  extend: 'Ext.form.Panel',
  autoHeight: true,
  initComponent: function() {
    var component = this;
    var procedure_type_id = Ext.id(),
      date_published_id = Ext.id();

    component.typesStore = Application.models.Tsn_Procedure.getTypesStore();


    this.addEvents('procedurechanged');
    this.addEvents('onEditing');

    Ext.apply(this, {
      labelWidth: 300,
      defaults: {
        anchor: '100%',
        defaults: {
          border: false,
          anchor: '100%',
          labelWidth: 300,
          allowBlank: false
        }
      },
      bodyCssClass: 'subpanel',
      items: [{
        xtype: 'fieldset',
        style: 'margin-top: 5px',
        title: 'Общие сведения о лоте',
        items: [
        {
          fieldLabel: 'Тип лота',
          xtype: 'combo',
          id: procedure_type_id,
          store: component.typesStore,
          displayField: 'name',
          valueField: 'id',
          editable: false,
          triggerAction: 'all',
          forceSelection: true,
          mode: 'local',
          emptyText: 'Выберите форму торгов',
          name: 'procedure_type',
          qtipConfig: {
            title: 'Форма торгов',
            html: '<p>Если Вы выберете тип "Фиксированная цена", Ваш товар будет продан по заявленной'+
                   ' цене без проведения торгов первому подавшему заявку покупателю. В течение трех рабочих'+
                   ' с момента поступления первой заявки Вам нужно будет принять решение о согласии поставить'+
                   ' товар данному покупателю. Если Вы примете решение отклонить данную заявку, Ваш лот останется'+
                   ' в активном состоянии и продолжится ожидание поступления заявки от другого покупателя. Если Вы'+
                   ' не примете решение по заявке в течение трех рабочих дней с момента ее поступления, это будет'+
                   ' по умолчанию выражать Ваше согласие поставить товар сделавшему заявку покупателю.</p><p> Если Вы выберете'+
                   ' тип "Торги на повышение", то с момента подачи первого предложения, цена которого больше или равна'+
                   ' указанной Вами начальной цене, система будет ожидать поступления следующего ценового предложения'+
                   ' в течение одной недели. С момента подачи второго предложения время ожидания третьего предложения'+
                   ' составляет 24 часа. С момента подачи третьего предложения время ожидания четвертого предложения'+
                   ' составляет 1 час. После того как торги будут окончены, Вам будет доступен просмотр ранжированных'+
                   ' предложений участников и возможность продажи товара одному или нескольким из них.</p>',
            autoHide: false,
            applyTipTo: 'label'
          },
          plugins: [Ext.ux.plugins.ToolTip ],
          listeners: {
            select: function(combo, value) {
              //Ext.getCmp(date_published_id).fireEvent('typeComboLoaded');
              component.fireEvent('procedurechanged', combo.getValue());
            }
          }
        }, {
          fieldLabel: 'Номер извещения',
          html: 'Генерируется после публикации',
          name: 'registry_number'
        }, {
          fieldLabel: 'Дата публикации лота'+REQUIRED_FIELD,
          xtype: 'Application.components.dateField',
          id: date_published_id,
          format: 'd.m.Y',
          altFormats: 'c|d.m.Y H:i:s|d.m.Y H:i',
          anchor: null,
          name: 'date_published',
          width: 200,
          value: now(),
          minValue: new Date()
        }, {
          xtype: 'textarea',
          name: 'title',
          height: 50,
          autoScroll: true,
          qtipConfig: {
            html: 'Введите краткое наименование товара и его основные характеристики. Это наименование будет отображаться в списках лотов в кабинетах потенциальных покупателей',
            autoHide: false,
            applyTipTo: 'label'
          },
          plugins: [Ext.ux.plugins.ToolTip ],
          fieldLabel: 'Краткое наименование лота'+REQUIRED_FIELD
        }, {
          xtype: 'Application.components.combo',
          fieldLabel: 'Валюта лота',
          store: getCurrencyStore(),
          valueField: 'id',
          displayField: 'description',
          name: 'currency',
          hiddenName: 'currency_val',
          value: this.value?this.value.currency:810,
          mode: 'local',
          editable: false,
          triggerAction: 'all',
          renderer: function(values) {
            return Ext.util.Format.countryFlag(values.alpha2||values.alpha3)+' '+values.description;
          },
          listeners: {
            beforerender: function() {
              var st = this.getStore();
              st.on('load', function(){
                this.setValue(this.value);
              }, this, {once: true});
            }
          }
        }]
      }, {
        xtype: 'fieldset',
        title: 'Сведения об организаторе',
        items: [{
          fieldLabel: 'Наименование организации',
          html: Main.contragent.full_name
        /*}, {
          fieldLabel: 'Тип организации',
          html: Main.contragent.customer_status||'Заказчик'*/
        }, {
          fieldLabel: 'Местонахождение',
          html: Main.contragent.legal_address||'-'
        }, {
          fieldLabel: 'Почтовый адрес организатора',
          html: Main.contragent.postal_address||'-'
        }, {
          xtype: 'Application.components.phonePanel',
          name: 'contact_phone',
          fieldLabel: 'Контактный телефон'+REQUIRED_FIELD,
          value: Main.user.user_phone
        }, {
          xtype: 'textfield',
          vtype: 'email',
          name: 'contact_email',
          fieldLabel: 'Адрес эл. почты'+REQUIRED_FIELD,
          value: Main.contragent.email
        }, {
          xtype: 'textfield',
          fieldLabel: 'Контактное лицо',
          name: 'contact_person',
          value: Main.user.full_name
        }]
      }],
      getValues: function() {
        var dt=null;
        var v = {organizer_contragent_id: this.organizer_contragent_id};
        collectComponentValues(this, v, true);
        v.procedure_type = component.procedure_type_id;
        return v;
      },
      setValues:function(v) {
        setComponentValues(this, v, true);
        if (v.procedure_type) {
          this.fireEvent('procedurechanged', v.procedure_type);
        }
        
        if(null!=v.date_published && v.version && v.version>=1) {
          Ext.getCmp(procedure_type_id).disable();
          this.fireEvent('onEditing');
        }
      }
    });
    this.listeners = this.listeners||{};

    this.procedureTypeChanged = function(p) {
      component.procedure_type_id = p;
    };

    Ext.apply(this.listeners, {
      procedurechanged: this.procedureTypeChanged,
      scope: this
    });

    this.organizer_contragent_id = Main.contragent.id;
    Application.components.basicForm.superclass.initComponent.call(this);
    autoSetValue(this);
    this.fireEvent('procedurechanged', Application.models.Tsn_Procedure.type_ids.auction);
  }
});
