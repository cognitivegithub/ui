/**
 * Компонент поисковой панели. Предназначен для использования в качестве тулбара
 * Параметры:
 *
 *   eventTarget: компонент, куда направляются евенты поиска,
 *   если не указан ивент срабатывает у этого элемента, просто повесьте на него слушатель
 *   оставлен для совместимости с legacy кодом
 *
 *   searchHelp: фоновый текст, отображаемый в строке поиска когда она пуста
 *
 *   advancedSearch: массив элементов, которые будут отображаться в расширенном
 *   варианте поиска. Если не указать — расширенного поиска не будет.
 *     Это массив аля items, дефолтный тип textitem. Элементы распределяются по
 *   колонкам, правила аналогичны лейауту table (т.е. элементы кидаются по очереди
 *   в каждую из колонок). Допустимо использование элемента null для пропуска
 *   колонки при распределении. Тип элемента по умолчанию — textfield.
 *     Допустимо указывать тип '...interval', в таком случае будет сгенерировано
 *   два инпута с типом '...field'. Параметры name этих инпутов будут сгенерированы из name
 *   элемента с interval, и выглядеть как name_from, name_till (где name это
 *   значение name элемента interval). Параметры поля применяются к обоим инпутам.
 *
 *   advancedSearchDefaults: дефолты для элементов advancedSearch
 *
 *   advancedSearchText: текст у кнопки расширенного поиска
 *
 *   searchText: текст у кнопки поиска (по умолчанию «Искать»)
 *
 *   advancedSearchParams: параметры формы поиска
 *      columns: число колонок в форме поиска. Возможные значения 1 и 2
 *
 *   advancedSearchActive: раскрыть форму расширенного поиска сразу (по умолчанию
 *   она скрыта)
 *
 *   advancedSearchOnly: юзаем только форму расширенного поиска (без поля Быстрый поиск)
 *
 *   items: массив элементов, которые следует дополнительно добавить к панели
 *
 *   itemsAlign: положение, куда добавлять дополнительные айтемы. Возможные
 *   значения: 'left', 'right'
 *
 *   itemsBottom: элемент который следует добавить ниже панели поиска
 *
 * Евенты:
 *   search(query, [advanced_query]) [OUT]
 *     Стреляется в компонент eventTarget при нажатии пимпы «Искать»
 *       query — текст набранный в поисковой строке
 *       advanced_query — значения из формы расширенного поиска (если есть,
 *       или undefined)
 *   clear()
 *    Срабатывает при нажатии кнопки очистки поиска
 *   resize()
 *    срабатывает при ресайзе
 */
Ext.define('Application.components.searchToolbar', {
  extend: 'Ext.panel.Panel',
  searchHelp: 'Быстрый поиск',
  searchText: 'Искать',
  eventTarget: null,
  advancedSearch: null,
  advancedSearchText: 'Расширенный поиск',
  advancedSearchParams: null,
  advancedSearchActive: false,
  advancedSearchOnly: false,
  itemsAlign: 'left',
  items: null,
  itemsBottom: null,
  border: true,
  searchTools: null,
  initComponent : function () {
    var component = this;
    var search_container_id = Ext.id();
    var search_button_id = Ext.id();
    var extended_search_id_fieldset = Ext.id();
    var cleaner_id = Ext.id();
    var cleaner_shown = false;
    var items = this.items;
    var itemsBottom = this.itemsBottom;
    this.ids = {
      search_field: Ext.id(),
      extended_search: Ext.id(),
      extended_button: Ext.id()
    };
    var searchHandler = function() {
      // если нет цели делаем событие на самом элементе, поймаем в том мете где вызвали элемент
      var eventTarget;
      if(this.eventTarget) {
        eventTarget = this.eventTarget;
      } else {
        eventTarget = this;
      }
      var values = component.getValues();
      if(!component.advancedSearchOnly) {
        eventTarget.fireEvent('search', values.query, values.advancedActive?values.advancedValues:{});
      } else {
        eventTarget.fireEvent('search', values.advancedValues);
      }
    };

    if (!this.border) {
      this.bodyCssClass = 'cleanborder';
    }


    Ext.apply(this, {
      layout: 'auto',
      frame: false,
      cls: 'x-panel-mc',
      style: 'padding: 0px',
      defaults: {
        border: false,
        frame: false,
        cls: 'cleanborder'
      },
      items: [],
      doSearch: searchHandler
    });

    if(!this.advancedSearchOnly) {
      var fastSearchPanel = {
        layout: 'hbox',
        xtype: 'toolbar',
        items: [
          {
            xtype: 'container',
            flex: 1,
            height: 20,
            id: search_container_id,
            layout: 'anchor',
            items: [{
              xtype: 'textfield',
              anchor: '100%',
              id: this.ids.search_field,
              emptyText: this.searchHelp,
              enableKeyEvents : true,
              stateful: this.state_id ? true : false,
              stateId: this.state_id ? this.state_id : null,
              stateEvents: ['select', 'change', 'blur'],
              getState: function() {
                return {value:this.getValue()}
              },
              listeners : {
                change: function(field) {
                  field.updateCleaner();
                },
                staterestore: function(field) {
                  field.updateCleaner();
                },
                afterrender: function(field) {
                  field.updateCleaner();
                },
                blur: function(field) {
                  field.updateCleaner();
                },
                keydown : function (field, e) {
                  field.updateCleaner();
                  if (e.getKey() == e.ENTER) {
                    Ext.getCmp(search_button_id).handler.call(this);
                  }
                },
                scope: this
              },
              setValue: function(v) {
                Ext.form.TextField.superclass.setValue.call(this, v);
                this.updateCleaner();
              },
              updateCleaner: function() {
                var cleaner = Ext.get(cleaner_id);
                if (cleaner) {
                  var v = this.getValue();
                  if (v && !cleaner_shown) {
                    cleaner.fadeIn(0.5);
                    cleaner_shown = true;
                  } else if (!v && cleaner_shown) {
                    cleaner.fadeOut(0.5);
                    cleaner_shown = false;
                  }
                } else {
                  this.updateCleaner.defer(500, this);
                }
              }
            }]
          }, {
            text: this.searchText,
            id: search_button_id,
            style: 'padding-left: 2px',
            handler: searchHandler,
            cls:'x-btn-text-icon',
            icon: 'ico/search.png',
            scope: this
          }
        ]
      };
       this.items.push(fastSearchPanel);
    }

    if (this.advancedSearch) {
      this.advancedSearchDefaults = this.advancedSearchDefaults||{};
      Ext.apply(this.advancedSearchDefaults, {}, {
        clearValue: this.itemClearValue
      });
      var extended_search = this.renderSearchForm();
      if(this.advancedSearchButtonAlign) extended_search.buttonAlign = this.advancedSearchButtonAlign;
      else extended_search.buttonAlign = 'center';
      extended_search.id = this.ids.extended_search;
      // невидимая кнопка, которая срабатывает по ентеру (блок buttons вне формы,
      // поэтому type: 'submit' там не срабатывает)
      extended_search.items.push({
        xtype: 'button',
        hidden: true,
        type: 'submit',
        scope: this,
        handler: searchHandler
      });
      extended_search.keys = [{
        key: [Ext.EventObject.ENTER],
        scope: this,
        handler: searchHandler
      }];
      extended_search.buttons = [{
        text: this.searchText,
        handler: searchHandler,
        scope: this
      }, {
        text: 'Очистить поиск',
        scope: this,
        id: (this.resetButton) ? this.resetButton : Ext.id(),
        handler: function() {
          var search = Ext.getCmp(this.ids.extended_search);//.getForm().reset();
          if (search) {
            cleanFormItems(search);
          }
          var hiddenBasis = Ext.getCmp(component.basis_for_single_supplier);
          if (hiddenBasis) {
            hiddenBasis.setValue(null);
            hiddenBasis.hide();
          }
          var sf = Ext.getCmp(this.ids.search_field);
          if (sf) sf.setValue('');
          searchHandler.call(this);
          component.fireEvent('clear');
        }
      }];
      this.items.push({
        id: extended_search_id_fieldset,
        layout: 'form',
        hidden: !this.advancedSearchActive,
        items: [{
          xtype: 'fieldset',
          title: 'Введите параметры поиска',
          cls: 'spaced-fieldset',
          style: 'padding-bottom: 0',
          items: [extended_search]
        }]
      });
      if(!this.advancedSearchOnly) {
        this.items[0].items.push({
          text: this.advancedSearchText,
          enableToggle: true,
          id: this.ids.extended_button,
          cls:'x-btn-text-icon',
          icon: 'ico/settings1.png',
          pressed: this.advancedSearchActive,
          listeners: {
            toggle: function(btn, pressed) {
              var panel = Ext.getCmp(extended_search_id_fieldset);
              if (!panel) {
                return;
              }
              if (component.eventTarget) {
                component.eventTarget.fireEvent('statechanged');
              }
              if (pressed!=component.advancedSearchActive) {
                if (pressed) {
                  panel.show();
                } else {
                  panel.hide();
                }
                component.fireEvent('resize');
                if (component.eventTarget) {
                  component.eventTarget.doLayout();
                }
              }
              component.advancedSearchActive = pressed;
            }
          }
        });
      }
    } else {
      this.advancedSearchActive=false;
    }
    if (items) {
      if ('left' == this.itemsAlign) {
        this.items[0].items.unshift.apply(this.items[0].items, items);
      } else {
        this.items[0].items.push.apply(this.items[0].items, items);
      }
      items=null;
    }
    this.searchTools = this.searchTools||[];
    this.searchTools.push({
      id: 'close',
      align: 'right',
      hidden: true,
      handler: function() {
        Ext.getCmp(component.ids.search_field).setValue(null);
      },
      tip: 'Очистить поле',
      toolId: cleaner_id
    });
    if (this.searchTools && this.searchTools.length) {
      this.on('afterrender', function(){
        var search = Ext.getCmp(this.ids.search_field);
        var created_tools = [];
        if (search) {
          search.on('afterrender', function(){
            var el = search.getEl();
            var left_padding = 0;
            var right_padding = 0;
            for (var i=0; i<this.searchTools.length; i++) {
              var st = this.searchTools[i];
              var leftAlign = (st.align=='left')?true:false;
              var classes = [
                'x-search-tool-' + (leftAlign?'left':'right'),
                'x-tool',
                'x-tool-' + st.id
              ];
              var cfg = {
                tag: 'div',
                cls: classes.join(' ')
              };
              if (st.tip) {
                cfg['ext:qtip'] = st.tip;
              }
              if (st.toolId) {
                cfg['id'] = st.toolId;
              }
              if (st.extra) {
                Ext.apply(cfg, st.extra);
              }
              if (st.hidden) {
                cfg.style = 'visibility: hidden; '+(cfg.style||'');
              }
              if (leftAlign && left_padding>0) {
                cfg.style = 'left: '+(left_padding*17)+'px; '+(cfg.style||'');
              } else if (right_padding>0) {
                cfg.style = 'right: '+(right_padding*19)+'px; '+(cfg.style||'');
              }

              var tool = el.insertSibling(cfg, leftAlign?'after':'before');
              created_tools.push(tool);
              if (st.handler) {
                tool.on('click', st.handler, st.scope||this)
              }
              if (leftAlign) {
                left_padding++;
              } else {
                right_padding++;
              }
            }
            if (left_padding>0) {
              el.setStyle('padding-left', (left_padding*17+5)+'px');
            }
            if (right_padding>0) {
              el.setStyle('padding-right', (right_padding*19+5)+'px');
            }
          }, this, {single: true});
          search.on('destroy', function(){
            for (var i=0; i<created_tools.length; i++) {
              created_tools[i].remove();
            }
            created_tools = [];
            this.searchTools = [];
          }, this, {single: true});
        }
      }, this, {single: true});
    }

      //add bottom items
      if (itemsBottom){
          this.items.push(itemsBottom);
      }

    Application.components.searchToolbar.superclass.initComponent.call(this);
  },
  renderSearchForm: function () {
    var items = this.advancedSearch;
    var params = this.advancedSearchParams||{};
    var columns = params.columns||2;
    var i, n, t;
    if (this.advancedSearchDefaults) {
      for (i=items.length-1; i>=0; i--) {
        Ext.apply(items[i], {}, this.advancedSearchDefaults)
      }
    }
    var form = {
      xtype: 'panel',
      autoHeight: true,
      layout: 'column',
      cls: 'cleanborder',
      bodyCssClass: 'cleanborder',
      anchor: '-30',
      defaults:{
        layout:'form',
        border:false,
        xtype:'panel',
        cls: 'cleanborder',
        bodyCssClass: 'cleanborder',
        defaultType: 'textfield',
        labelWidth: params.labelWidth||140
      },
      items: []
    };
    for (i=0; i<columns-1; i++) {
      form.items.push({
        bodyStyle:'padding:1px 18px 0 0',
        columnWidth: 1/columns - 0.1/(columns-1),
        items: []
      });
    }
    form.items.push({
      columnWidth: 1/columns + (columns>1?0.1:0),
      items: []
    });
    for (i=0; i<items.length; i++) {
      n = i%columns;
      t = items[i];
      if (!t) {
        continue;
      }
      if ('submit'==t.type) {
        n=0;
      } else {
        t.anchor = (typeof t.anchor != 'undefined')? t.anchor:'100%';
        t.fieldLabel = '<b>'+t.fieldLabel+'</b>';
      }
      if (t.xtype && t.xtype.indexOf('interval')>0) {
        var cfg = Ext.apply({}, t);
        var unset = ['id', 'name', 'fieldLabel', 'fromText', 'tillText', 'labelStyle', 'tillAlign', 'fromValue', 'tillValue'];
        var extra = {align: cfg.tillAlign};
        for (var j=0; j<unset.length; j++) {
          delete cfg[unset[j]];
        }
        cfg.xtype = t.xtype.replace('interval', t.intervalType||'field');
        t = {
          layout: 'column',
          border: false,
          cls: 'cleanborder',
          bodyCssClass: 'cleanborder',
          xtype: 'panel',
          defaults:{
            layout:'form',
            border:false,
            bodyCssClass: 'cleanborder',
            xtype:'panel',
            labelWidth: form.defaults.labelWidth
          },
          items: [{
            //columnWidth:0.45,
            items: [{
              width: 100,
              name: t.name?(t.name+'_from'):undefined,
              id: t.id?(t.id+'_from'):undefined,
              format: t.format||'d.m.Y',
              fieldLabel: '<b>'+t.fieldLabel+' '+(t.fromText||'с')+'</b>',
              value: t.fromValue,
              stateful: t.state_id ? true : false,
              stateId: t.state_id ? (t.state_id+'_from') : null,
              stateEvents: t.state_id ? ['select', 'change', 'blur'] : null,
              getState: function() {
                return {value:this.getValue()}
              },
              reset: function() {
                this.setValue(null);
                this.fireEvent('change');
              }
            }]
          }, {
            labelWidth: 35,
            items:[{
              xtype: cfg.xtype,
              width: 100,
              name: t.name?(t.name+'_till'):undefined,
              id: t.id?(t.id+'_till'):undefined,
              format: t.format||'d.m.Y',
              fieldLabel: '<b>'+(t.tillText||'по')+'</b>',
              labelStyle: 'text-align: right;',
              value: t.tillValue,
              stateful: t.state_id ? true : false,
              stateId: t.state_id ? (t.state_id+'_till') : null,
              stateEvents: t.state_id ? ['select', 'change', 'blur'] : null,
              getState: function() {
                return {value:this.getValue()}
              },
              reset: function() {
                this.setValue(null);
                this.fireEvent('change');
              }
            }]
          }]
        };
        if ('date' == extra.align) {
          t.items[1].items[0].listeners = {
            select: function(field, date) {
              date.setHours(23, 59);
              field.setValue(date);
            }
          };
        }
        Ext.apply(t.items[0].items[0], cfg);
        Ext.apply(t.items[1].items[0], cfg);
      }
      form.items[n].items.push(t);
    }
    return form;
  },
  itemClearValue: function() {
    this.reset();
    if (typeof this.defaultValue != 'undefined') {
      this.setValue(this.defaultValue);
    } else if (typeof this.initialConfig.value != 'undefined') {
      this.setValue(this.initialConfig.value);
    }
    this.fireEvent('change');
  },
  getValues: function() {
    var values = {
      advancedActive: !!this.advancedSearchActive
    };
    var cmp = this.ids.search_field?Ext.getCmp(this.ids.search_field):null;
    if (cmp) {
      values.query = cmp.getValue();
    }
    cmp = this.ids.extended_search?Ext.getCmp(this.ids.extended_search):null;
    if (cmp) {
      values.advancedValues = {};
      collectComponentValues(cmp, values.advancedValues);
    }
    return values;
  },
  setValues: function(values) {
    var cmp = this.ids.search_field?Ext.getCmp(this.ids.search_field):null;
    if (cmp) {
      cmp.setValue(values.query?values.query:undefined);
    }
    cmp = this.ids.extended_search?Ext.getCmp(this.ids.extended_search):null;
    if (cmp) {
      setComponentValues(cmp, values.advancedValues);
    }
    cmp = this.ids.extended_button?Ext.getCmp(this.ids.extended_button):null;
    if (cmp) {
      cmp.toggle(values.advancedActive);
    }
  }
});
