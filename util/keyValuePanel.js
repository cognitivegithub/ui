/**
 * @class Application.components.keyValuePanel
 * @extends Ext.form.FieldSet
 *
 * Панель для отображения таблицы имён-значений.
 * Имена передаются в свойстве fields конфига при создании экземпляра компонента:
 * fields: {id: 'Идентификатор', name: 'Имя', surname: 'Фамилия', ...}
 * Значения передаются в любое время после инициализации компонента в метод loadData
 * объектом с теми же свойствами:
 * cmp.loadData({id: 123, name: 'Иван', surname: 'Иванов', ...})
 * Если какого-либо ключа из fields не будет в переданных данных, вместо данных
 * в строке после имени будет записана пустая строка.
 */
Ext.define('Application.components.keyValuePanel', {
  extend: 'Ext.form.FieldSet',
  //layout: 'table',
  cls: 'keyvalue-panel-table',

  //defaultType: 'label',
  hideBorders: true,
  //items : [],
  //bodyStyle: 'border: none',
  //layoutConfig: {columns: 2},

  /**
   * @cfg {Object} values
   * Объект со значениями данных:
   * {id: 123, name: 'Иван', surname: 'Иванов', ...}
   * Используется если требуется задать значения ещё до отрисовки.
   */
  /**
   * @cfg {Object} fields
   * Объект с названиями полей данных, те же ключи затем будут ожидаться
   * для передаваемых в loadData данных:
   * {id: 'Идентификатор', name: 'Имя', surname: 'Фамилия', ...}
   */
  /**
   * @cfg {Object} templates
   * Объект с шаблонами для данных, если для какого-то ключа задан шаблон,
   * данные перед отображением будут преобразованы по этому шаблону.
   * В параметры шаблона передаётся весь объект данных.
   * Шаблоны можно задавать строками — в этом случае они будут преобразованы
   * в Ext.XTemplate во время инициализации.
   * {url: '<a href="{url}"><tpl if="urltext!==undefined">{urltext}</tpl><tpl if="urltext===undefined">{url}</tpl></a>'}
   */

  /**
   * @cfg {String} noValueText
   * текст для отображения в случаях, если значение отсутствует
   */
  noValueText: 'не указано',

  /**
   * @cfg {String} captionCls
   * CSS класс для ячеек с заголовками
   */
  captionCls: 'th',

  initComponent: function() {
    this.fieldKeys = [];

    if ( !Ext.isObject(this.fields) )
      this.fields = {};

    if ( !Ext.isObject(this.templates) ) {
      this.templates = {};
    } else {
      for (var k in this.templates) {
        if ( Ext.isString(this.templates[k]) )
          this.templates[k] = new Ext.XTemplate(this.templates[k]);
      }
    }

    this.initValues();
    this.addEvents(
      /**
       * @event dataload
       * Срабатывает во время загрузки данных в компонент.
       * @param {Object} data Загруженные данные
       */
      'dataload'
    );

    this.doFields();
    //this.autoHeight = true;
    //this.items = Ext.apply([], items);
    
    //Инициализируем элементы после, когда уже есть все контролки
    this.on('render', function(){
      var values = this.getValues();
      this.setValues(values);
    });

    if (this.data) {
      this.loadData(this.data);
    }
    Application.components.keyValuePanel.superclass.initComponent.call(this);
  },
  
  doFields : function() {
    if (undefined === this.items) {
      this.items = [];
    }
    for (var k in this.fields) {
      if (!this.fields.hasOwnProperty(k)) {
        continue;
      }
      if (undefined !== this.fieldKeys[k]) {
        //2014/03/11 ptanya POSPBA-237 Повторно поля не отображаем
        continue;
      }
      this.fieldKeys[k] = 1;
      
      //2014/03/21 ptanya 4039 Среди полей может быть элемент формы
      if (null != this.fields[k] && !!this.fields[k].xtype) {
        if (this.rendered) {
          this.add(this.fields[k]);
        } else {
          this.items.push(this.fields[k]);
        }
        continue;
      }

      // Заголовок поля
      var label = {
        xtype: 'panel',
        key: k+'-row',
        layout: 'table',
        cls: 'spaced-bottom-shallow',
        defaultType: 'label',
        //autoHeight: true,
        layoutConfig: {columns: 2},
        items: [{
          // id использовать не следует, иначе будут ошибки при отображении
          // множества компонентов с одинаковыми ключами полей
          key: k + '-caption',
          cellCls: this.captionCls,
          html: this.formatTitle(t(this.fields[k]))
        }, {
          key: k
        }]
      };
      if (this.rendered) {
        this.add(label);
      } else {
        this.items.push(label);
      }
    }
    
    if (this.rendered) {
      this.doLayout();
    }
      
    //this.items = items;
  },

  /**
   * Загрузка данных в компонент для их отрисовки.
   * @param {Object} data Данные для отрисовки.
   * @return {Application.components.keyValuePanel} this
   */
  loadData: function(data) {
    this.fireEvent('dataload', data);
    this.setValues(data);
    return this;
  }, // loadData


  // private
  initValues: function() {
    if (this.values !== undefined) {
      this.setValues(this.values);
    } else {
      this.values = {};
    }
  }, // initValues

  getValues: function() {
    return this.values || {};
  },
  //2014/04/01 ptanya 4039
  getStoreValues: function() {
    return this.store_values || {};
  },

  /**
   * Задаёт значения данных.
   * @param {Object} values Объект со значениями полей.
   * @return {Application.components.keyValuePanel} this
   */
  setValues: function(values) {
    this.store_values = values; //2014/03/19 ptanya 4039
    if ( Ext.isObject(values) ) {
      for (var k in this.fields) {
        this.setValue(k, values);
      } // for k in .fields
    } // if isobject values

    return this;
  }, // setValues
  
  /**
   * Задаёт значения данных для одного поля.
   * @param {String} k название поля.
   * @param {Object} values Объект со значениями полей.
   * @return {Application.components.keyValuePanel} this
   */
  setValue: function(k, values) {
    if (!this.fields.hasOwnProperty(k)) {
      return;
    }
    if (Ext.isEmpty(values[k]) && (!this.fieldsShowAlways || this.fieldsShowAlways.indexOf(k)<0) ) {
      if (this.rendered) {
        var empty_block = this.items.find(function(item) {
          return (item.key == k+'-row');
        });
        if (empty_block) {
          empty_block.hide();
        }
        /*var empty_block_caption = this.items.find(function(item) {
          return (item.key == k + '-caption');
        });
        empty_block_caption.destroy();*/
      }
      return;
    }
    //this.values[k] = Ext.isEmpty(values[k]) ? 'не указано/не применимо' : values[k];
    if (Ext.isEmpty(values[k]) || values[k] === false) {
      this.values[k] = '';
    } else {
      this.values[k] = values[k];
    }
    if (this.rendered) {
      var label = this.items.find(function(item) {
        return (item.key == k+'-row');
      });
      if (label) {
        var textField = label.getComponent(1);
        if (textField) {
          var text = this.formatValue(k, this.values);
          textField.setText( text, false );
        }
        label.show();
      }
    }
  },
  
  /**
   * Задаёт значения данных для одного поля, когда данные об объекте в целом уже все есть. Полезно для словарных полей.
   * @param {String} k название поля.
   * @return {Application.components.keyValuePanel} this
   */        
  setValueByField: function(k) {
    if ( Ext.isObject(this.store_values) ) {
      this.setValue(k, this.store_values);
    }
  },
     
  /**
   * Возвращает значения данных для одного поля, когда данные об объекте в целом уже все есть. Полезно полей зависимых от других.
   * @param {String} k название поля.
   */  
  getDataByField: function(k) {
    if ( Ext.isObject(this.store_values) ) {
      return this.store_values[k];
    }
  },

  formatTitle: function(name) {
    if (name && name.length > 0) {
      if (':' !== name.charAt(name.length - 1)) {
        return name + ':';
      }
    }
    return name;
  },
          
  formatValue: function(name, values) {
    var text = values[name];
    if (Ext.isObject(text)) {
      text = '';
      Ext.iterate(values[name], function (key, value) {
        text += ' ' + value;
      })
    }

    // Потенциально может получиться некрасиво если в шаблоне используется значение,
    // которое ещё не прошло валидацию первой строкой и содержит false, например.
    if (!Ext.isEmpty(text) || (this.fieldsShowAlways && this.fieldsShowAlways.indexOf(name)>=0)) {
      if (this.templates && this.templates[name]) {
        if (Ext.isFunction(this.templates[name])) {
          text = this.templates[name](text, this);
        } else {
          text = this.templates[name].apply(this.values);
        }
      } else if (Ext.isDate(text)) {
        text = Ext.util.Format.localDateText(text);
      }
    }
    if (Ext.isEmpty(text)) {
      text = this.noValueText;
    }
    return text + ''; //2014/03/27 ptanya 4039 конвертируем в строку. С числами какие-то чудеса происходят... если словари подгружены
  },

  hideKey: function(key) {
    var changed = false;
    this.items.each(function(i){
      if (i.key == key+'-row' || i.key==key) {
        changed = true;
        i.hide();
      }
    });
    if (changed) {
      this.doLayout();
    }
  },

  /// Спрятать поле, даже если оно добавлено в fieldsShowAlways
  hideKeyForced: function(key) {
    var changed = false;
    this.items.each(function(i){
      if (i.key == key+'-row' || i.key==key) {
        changed = true;
        i.getComponent(0).hide();
        i.getComponent(1).hide();
      }
    });
    if (changed) {
      this.doLayout();
    }
  }

});
