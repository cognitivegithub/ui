/**
 * Компонент для ввода телефонного номера. Состоит из трех полей: код страны,
 * города и номер телефона
 *
 * Параметры:
 *   fieldLabel, allowBlank, и т.п. — стандартные поля Ext.form.Field
 *
 *   name — базовый name у полей. name полей считается как база плюс «[cntr_code]»,
 *   «[city_code]», «[number]», т.е. если этот компонент разместить в форме, то
 *   при сабмите номер телефона придет массивом
 *
 *   value — значение по умолчанию. Может быть как строкой вида «1-234-1234567»,
 *   так и объектом {cntry_code: '1', city_code: '234', number: '1234567'}
 *
 * Евенты:
 *   нет
 */
Application.components.phonePanel = Ext.extend(Ext.form.CompositeField, {
  name: '',
  cls: 'cleanbackground',
  allowBlank: true,
  blankText: 'поле не заполнено',
  msgTarget: 'under',
  fieldLabel: '',
  initComponent: function() {
    var cls = 'x-form-text cleanborder cleanbackground';
    var component = this;
    var ready = false, validate = false;
    var cntry_id = Ext.id(), city_id = Ext.id(), number_id = Ext.id(), error_id = Ext.id();
    //var cntry_id = component.name+'_cntr_code', city_id = component.name+'_city_code', number_id = component.name+'_number', error_id = Ext.id();
    var on_validation = false;
    if ('side' === this.msgTarget) {
      this.msgTarget = error_id;
    }
    this.validator = function(value) {
      var cntry = Ext.getCmp(cntry_id);
      var city = Ext.getCmp(city_id);
      var number = Ext.getCmp(number_id);
      var fields = [cntry, city, number];
      var i;
      if (component.allowBlank && ''===cntry.getValue() && ''===city.getValue() && ''===number.getValue()) {
        if (on_validation) {
          return true;
        }
        on_validation = true;
        if (ready) {
          component.validate();
          for (i=0; i<fields.length; i++) {
            fields[i].validate();
          }
        } else {
          validate = true;
        }
        on_validation = false;
        return true;
      }
      if (!on_validation) {
        on_validation = true;
        if (ready) {
          component.validate();
        } else {
          validate = true;
        }
        on_validation = false;
      }
      if ('' === value) {
        return component.blankText;
      }
      return true;
    };

    var default_type = {
      xtype: 'textfield',
      hideLabel: true,
      width: 80,
      validator: this.validator,
      readOnly: this.readOnly,
      style: (this.noneditable ? 'background: transparent; border: none;' : ''),
      cls: this.itemsCssClass,
      allowBlank: true,
      vtype: 'digits'
    };
    if (this.value) {
      if (Ext.isString(this.value)) {
        var v = this.value.split('-');
        this.value = {
          cntr_code: v[0]||null,
          city_code: v[1]||null,
          number: v[2]||null
        }
      }
    } else {
      this.value = {};
    }
    var values = [
      Ext.apply({},
        {name: this.name+'[cntr_code]', width: 20, id: cntry_id, fieldLabel: 'код страны', maxLength: 5},
        default_type),
      Ext.apply({},
        {name: this.name+'[city_code]', width: 30, id: city_id, fieldLabel: 'код города',  maxLength: 6},
        default_type),
      Ext.apply({},
        {name: this.name+'[number]', id: number_id, fieldLabel: 'номер телефона', minLength: 5, maxLength: 100},
        default_type)
    ];
    if (this.value.cntr_code) {
      values[0].value = this.value.cntr_code;
    }
    if (this.value.city_code) {
      values[1].value = this.value.city_code;
    }
    if (this.value.number) {
      values[2].value = this.value.number;
    }
    delete this.value;
    this.items = [
      {xtype: 'displayfield', value: '+', cls: cls},
      values[0],
      {xtype: 'displayfield', value: '(', cls: cls},
      values[1],
      {xtype: 'displayfield', value: ')', cls: cls},
      values[2]
    ];
    if (this.msgTarget == error_id) {
      this.items.push({xtype: 'panel', anchor: '100%', height: 50, cls: 'x-form-invalid-msg', id: error_id});
    }
    //delete this['allowBlank'];
    Application.components.phonePanel.superclass.initComponent.call(this);
    this.on('afterrender', function(){
      ready=true;
      if (validate) {
        this.isValid();
      }
    }, this, {once: true});
    this.on('valid', function(obj) {
      var phone_val = obj.getValue();
      if (phone_val && (phone_val.length < 9 || phone_val.length > 101)) {
        obj.markInvalid('Значение поля ' + this.fieldLabel.replace(REQUIRED_FIELD, '') +
            ' должно быть от 5 до 100  символов');
      }
    });
  },
  getValue: function() {
    var v = [];
    this.items.each(function(c){
      if ('textfield'==c.xtype) {
        v.push(c.getValue());
      }
    })
    v = v.join('-');
    if ('--'==v) {
      v = null;
    }
    return v;
  },
  setValue: function(v) {
    if (! v) return;
    if (Ext.isString(v)) {
      v = v.split('-');
    }
    var i = 0;
    this.items.each(function(c){
      if ('textfield'==c.xtype) {
        if (c.rendered) {
          c.setValue(v[i]);
        } else {
          c.value = v[i];
        }
        i++;
      }
    });
  }
});
