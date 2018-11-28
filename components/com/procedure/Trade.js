
Ext.define('Application.components.Trade', {
  extend: 'Ext.form.Panel',
  lot_id: null,
  procedure_id: null,
  initComponent: function() {
    var component = this;
    this.is_participant = false;
    this.no_participant_text = false;
    this.direction = true;
    var ids = {};
    var i;
    var id_fields = ['current_price', 'current_diff', 'progress', 'my_last_offer',
                     'my_position', 'time_left', 'best_offer', 'trade_duration',
                     'offers_count', 'time_left_estimated', 'input_offer', 'disable_offers_hint',
                     'avail_offers_from', 'avail_offers_for', 'price_hint', 'offers_step_hint',
                     'error_panel', 'error_panel_text', 'offers_grid', 'offers_chart',
                     'no_participant', 'new_offer', 'start_price', 'input_currency',
                     'input_offer_row', 'direction_button', 'lot_direction_text',
                     'price_hint_notbest', 'avail_notbest_offers_from', 'avail_notbest_offers_for',
                     'offers_step', 'date_time_begin_auction', 'step_reduction', 'step_auction'
                    ];
    this.ids = ids;

    for (i=0; i<id_fields.length; i++) {
      ids[id_fields[i]] = Ext.id();
    }

    if (!this.lot_id && !this.procedure_id) {
      throw 'Не указан лот';
    }
    if ( !Main.user || 'guest'==Main.user.role) {
      this.is_participant = false;
      this.no_participant_text = 'Вы не '+link_to('auth/login', 'вошли в систему')+'. Вы можете только наблюдать за ходом торгов, но не участвовать.';
    } else if ( !isSupplier()) {
      this.is_participant = false;
      this.no_participant_text = 'В торгах могут участвовать только аккредитованные заявители.';
    }
    var offers_proxy = new Ext.data.DirectProxy({
      directFn: RPC.Offer.index,
      listeners: {
        load: function(p, data){
          this.offersRanges = null;
          if (data && data.result && data.result.ranges) {
            this.offersRanges = data.result.ranges;
            this.offersRanges.end_trade = parseDate(this.offersRanges.end_trade);
          }
        },
        scope: this
      }
    });
    this.offers_store = new Ext.data.DirectStore({
      proxy: offers_proxy,
      autoDestroy: true,
      totalProperty: 'totalCount',
      root: 'offers',
      remoteSort: true,
      autoLoad: true,
      idProperty: 'id',
      sortInfo: {
        field: 'id',
        direction: 'DESC'
      },
      baseParams: {lot_id: this.lot_id, limit: 50},
      fields: ['id', 'participant', 'participant_id',
               {name: 'reversed', type: 'bool'},
               {name: 'price', type: 'number'},
               {name: 'date_added', convert: function(v){return parseDate(v);}},
               {name: 'auction_stopped_offer', type: 'bool'},
               'highlight'],
      listeners: {
        load: function(store, records) {
          store.isLoaded = true;
          var cnt = Ext.getCmp(component.ids.offers_count);
          if (cnt) {
            cnt.setValue(store.getTotalCount().toString());
          }
          component.fireEvent('offersupdated');
        },
        exception: storeExceptionHandler,
        beforeload: function(store) {
          store.isLoaded = false;
        }
      }
    });
    this.rangeCheck = {
      min: null,
      max: null,
      notbestMin: null,
      notbestMax: null
    };
    this.minimumTradeOffer = parsePrice(Main.config.minimum_trade_offer) || 0.01;

    /// Окно публичного предложения для уведомления о понижении текущей цены либо переход на этап аукциона
    this.reductionChangePriceWindow = new Ext.Window({
      title: '<b style="color: red; font-size: 16px;">Внимание!!!</b>',
      top: 50,
      height: 120,
      width: 400,
      layout: 'fit',
      buttons: [{
        text     : 'Закрыть',
        handler  : function(){
          component.reductionChangePriceWindow.hide();
        }
      }],
      showSingle: function(text) {
        Ext.onReady(function() {
          if (!component.reductionChangePriceWindow.isVisible())
            component.reductionChangePriceWindow.show();
        });
        Ext.onReady(function() {
          if (component.reductionChangePriceWindow.isVisible())
            component.reductionChangePriceWindow.body.update(text);
        });
      }
    });

    addEvents(this, ['auctionstart', 'auctionstop', 'loaded', 'waitforstart', 'offersupdated']);

    var setFn = function(e, el) {
      component.setOfferPrice(el.innerHTML);
    };
    var offers_pager = null;
    if (this.offers_store.baseParams && this.offers_store.baseParams.limit) {
      offers_pager = renderPagingToolbar('', this.offers_store, this.offers_store.baseParams.limit)
    }
    Ext.apply(this, {
      frame: true,
      defaults: {
        border: false,
        defaults: {
          border: false
          //cls: 'subpanel'
        }
      },
      bodyCssClass : 'trade-panel',
      //style: (this.style||'')+' '+Ext.isIE?'padding-bottom: 10px;':'',
      items: [{
        layout: 'table',
        //cls: 'spaced-bottom',
        width: '100%',
        layoutConfig: {
          //align: 'stretchmax'
          columns: 3
        },
        items: [{
          //flex: 1,
          rowspan: 2,
          cellCls: 'trade-column trade-column-left',
          items: [{
            xtype: 'Application.components.valueField',
            fieldLabel: 'Начальная цена',
            id: ids.start_price,
            value: '—'
          }, {
            xtype: 'Application.components.valueField',
            cls: 'red',
            fieldLabel: 'Текущая цена',
            id: ids.current_price,
            value: 'отсутствует'
          }, {
            xtype: 'Application.components.valueField',
            fieldLabel: 'Шаг аукциона',
            id: ids.offers_step,
            value: '—'
          }, {
            xtype: 'Application.components.valueField',
            fieldLabel: 'Шаг понижения',
            id: ids.step_reduction,
            value: '—'
          }, {
            xtype: 'Application.components.valueField',
            fieldLabel: 'Текущее <span id="'+ids.lot_direction_text+'">снижение</span>',
            id: ids.current_diff,
            value: '0%'
          }, {
            xtype: 'progress',
            width: 200,
            id: ids.progress,
            value: 0
          }, {
            hidden: true,
            xtype: 'Application.components.valueField',
            fieldLabel: 'Ваше последнее ценовое предложение',
            id: ids.my_last_offer,
            value: 'отсутствует'
          }, {
            xtype: 'Application.components.valueField',
            hidden: true,
            fieldLabel: 'Ваша текущая позиция',
            id: ids.my_position,
            value: '-'
          }, {
            xtype: 'Application.components.valueField',
            cls: 'red',
            id: ids.time_left,
            fieldLabel: 'Времени до окончания',
            value: '--:--'
          }]
        }, {
          cellCls: 'trade-column',
          cls: 'red',
          xtype: 'fieldset',
          border: true,
          title: 'Лучшее предложение',
          items: [{
            height: 52,
            id: ids.best_offer,
            html: 'На данный момент отсутствует'
          }]
        }, {
          cellCls: 'trade-column trade-column-right',
          items: [{
            xtype: 'Application.components.valueField',
            fieldLabel: 'Продолжительность торгов',
            id: ids.trade_duration,
            value: '--:--'
          }, {
            xtype: 'Application.components.valueField',
            fieldLabel: 'Всего предложений подано',
            id: ids.offers_count,
            value: '—'
          }, {
            xtype: 'Application.components.valueField',
            fieldLabel: 'Расчетные дата и время окончания',
            id: ids.time_left_estimated,
            value: '--:--'
          }]
        }, {
          colspan: 2,
          xtype: 'fieldset',
          hidden: true,
          id: ids.new_offer,
          title: 'Новое ценовое предложение',
          border: true,
          items: [{
            layout: 'table',
            id: ids.input_offer_row,
            layoutConfig: {
              columns: 5
            },
            items: [{
              cls: 'bold',
              html: 'Ваше предложение:'
            }, {
              xtype: 'button',
              cls: 'x-btn-icon',
              icon: '/ico/up.png',
              id: this.ids.direction_button,
              scope: this,
              hidden: true,
              handler: function() {
                /*var is_negative=(Ext.get('offer-field').dom.value.indexOf('-')==0);
                var q=db.getEl().child(db.buttonSelector);
                q.setStyle('background-image','url(/ico/'+(is_negative?'down':'up')+'.png)');*/
              }
            }, {
              xtype: 'Application.components.priceField',
              cellCls: 'trace-input-price',
              id: ids.input_offer,
              width: 140,
              allowZero: false,
              allowNegative: false,
              allowBlank: false
            }, {
              cellCls: 'x-align-left',
              id: ids.input_currency,
              html: '—'
            }, {
              cellCls: 'x-align-right',
              xtype: 'button',
              text: 'Подать предложение',
              handler: function() {
                var input = Ext.getCmp(ids.input_offer);
                if (!input.isValid()) {
                  Ext.Msg.alert('Ошибка', input.getErrors()[0]);
                  return;
                }
                var offer = {
                  price: input.getValue(),
                  direction: this.direction
                };
                this.addOffer(offer);
              },
              scope: this
            }]
          }, {
            id: ids.disable_offers_hint,
            hidden: true,
            html: '&nbsp;'
          }, {
            id: ids.price_hint,
            hidden: true,
            cls: 'small-note',
            html: 'Разрешается подавать ценовые предложения от <span class="active-text" id="'+ids.avail_offers_from+'">...</span> '+
                                                           'до <span class="active-text" id="'+ids.avail_offers_for+'">...</span>',
            listeners: {
              afterrender: function() {
                Ext.get(ids.avail_offers_from).on('click', setFn);
                Ext.get(ids.avail_offers_for).on('click', setFn);
              }
            }
          }, {
            id: ids.price_hint_notbest,
            hidden: true,
            cls: 'small-note',
            html: 'Разрешается также подавать ценовые предложения от <span class="active-text" id="'+ids.avail_notbest_offers_from+'">...</span> '+
                                                           'до <span class="active-text" id="'+ids.avail_notbest_offers_for+'">...</span>'+
                                                           ' (торги в данном случае продлены не будут)',
            listeners: {
              afterrender: function() {
                Ext.get(ids.avail_notbest_offers_from).on('click', setFn);
                Ext.get(ids.avail_notbest_offers_for).on('click', setFn);
              }
            }
          }, {
            cls: 'small-note',
            html: '<span id="' + ids.offers_step_hint + '">...</span>'
          }]
        }]
      }, {
        hidden: true,
        xtype: 'panel',
        autoHeight: true,
        layout: 'table',
        id: ids.error_panel,
        layoutConfig : {
          columns : 2
        },
        cls: 'warning-panel spaced-bottom',
        items: [
          {
            xtype: 'panel',
            id: ids.error_panel_text,
            html: 'Бидибида АШЫПКО'
          },
          {
            cellCls: 'width_100px',
            xtype: 'button',
            text: 'Перезагрузить страницу',
            handler: function() {window.location.reload();}
          }
        ]
      }, {
        layout: 'table',
        height: 250,
        width: '100%',
        /*layoutConfig: {
          align: 'stretch'
        },*/
        //style: Ext.isIE?'padding-bottom: 10px;':'',
        items: [{
          flex: 1,
          cellCls: 'trade-column-bottom',
          height: 230,
          xtype: 'fieldset',
          border: true,
          title: 'Поданные ценовые предложения',
          layout: 'fit',
          items: {
            xtype: 'grid',
            //bodyCssClass: 'spaced-padding',
            //style: Ext.isIE?'margin-bottom: 10px;':'',
            store: this.offers_store,
            loadMask: true,
            cls: 'thinborder',
            id: ids.offers_grid,
            bbar: offers_pager,
            viewConfig: {
              forceFit: true,
              getRowClass: function(record) {
                if (record.data.highlight) {
                  return 'highlight';
                }
                return '';
              }
            },
            columns: [new Ext.grid.RowNumberer(),
              {header: 'Участник', dataIndex: 'participant', width: 60, hidden: Main.config.trade_hide_participants},
              {header: 'Предложение', dataIndex: 'price', width: 45, sortable: true,
                renderer: Ext.util.Format.formatPrice
              },
              {header: 'Дата и время', dataIndex: 'date_added', width: 60, sortable: true,
                renderer: Ext.util.Format.dateRenderer('d.m.Y H:i:s')
              },
              {header: 'Подано', dataIndex: 'auction_stopped_offer', width: 60, sortable: true, hidden: true,
                renderer: function(v){return v?'на доподаче':'в основное время';}
              }
            ]
          }
        }, {
          //width: 10,
          html: '&nbsp;'
        }, {
          flex: 1,
          cellCls: 'trade-column-bottom',
          height: 230,
          id: ids.offers_chart,
          xtype: 'fieldset',
          layout: 'fit',
          border: true,
          title: 'Ход торгов',
          items: []
        }]
      }, {
        html: this.no_participant_text,
        cls: 'x-align-center',
        id: ids.no_participant,
        hidden: true
      }]
    });
    this.waitForStartTask.scope = this;
    this.auctionPollTask.scope = this;
    this.offersCheckTask.scope = this;
    this.listeners = this.listeners||{};
    Ext.apply(this.listeners, {
      render: function() {
        this.loadData();
      },
      auctionstart: function() {
        this.isRunning = true;
        this.startPoll();
      },
      auctionstop: function() {
        this.isRunnung = false;
        Ext.TaskMgr.stop(this.offersCheckTask);
        Ext.TaskMgr.stop(this.auctionPollTask);
        Ext.TaskMgr.stop(this.waitForStartTask);
        var msg = '<p>Торги завершены</p>';
        if (Main.config.allow_participant_docs_update && this.is_participant && this.procedure && this.lot && this.lot.id
            && 2==this.procedure.application_stages
            && this.procedure.procedure_type == Application.models.Procedure.type_ids.peretorg_reduc)
        {
          msg += '<p>'+link_to('com/applic/edit/lot/'+this.lot.id,
                               'Обновить документы заявки в соответствии с ценой, указанной в ходе переторжки (при необходимости)')+
                 '</p>';
        }
        this.getEl().mask(msg);
      },
      waitforstart: function() {
        Ext.TaskMgr.start(this.waitForStartTask);
      },
      loaded: function() {
        var no_participant = Ext.getCmp(this.ids.no_participant);
        if (this.is_participant) {
          this.showParticipantFields();
          no_participant.hide();
          this.doLayout();
        } else {
          this.showParticipantFields(false);
          no_participant.update(this.no_participant_text);
          no_participant.show();
          this.doLayout();
        }
        if (this.procedure.procedure_type == Application.models.Procedure.type_ids.auction_up || this.procedure.procedure_type == Application.models.Procedure.type_ids.auction_up_26) {
          Ext.get(this.ids.lot_direction_text).update('повышение');
        }
        this.offers_store.reload();
        this.fireEvent('waitforstart');
      },
      destroy: function() {
        Ext.TaskMgr.stop(this.waitForStartTask);
        Ext.TaskMgr.stop(this.auctionPollTask);
        Ext.TaskMgr.stop(this.offersCheckTask);
      },
      offersupdated: function() {
        //this.dateEndAuction = getServerTime();

        function loadOffer(offer_data) {
          if (!offer_data) {
            return null;
          }
          offer_data.date_added = parseDate(offer_data.date_added);
          return {data: offer_data};
        }

        var best_offer;
        var my_offer;
        if (this.offersRanges) {
          best_offer = loadOffer(this.offersRanges.leading_offer);
          my_offer = loadOffer(this.offersRanges.my_best_offer);
        } else {
          best_offer = this.getLeadingOffer();
          my_offer = this.getMyBestOffer();
        }

        if (this.procedure.procedure_type == Application.models.Procedure.type_ids.public_sale) {
          best_offer = this.getLeadingOffer();
          my_offer = this.getMyBestOffer();
        }

        var last_offer_time;
        var leading_offer = 'На данный момент отсутствует';

        if (best_offer) {
          last_offer_time = best_offer.data.date_added;
          leading_offer = '';
          if (!Main.config.trade_hide_participants ||
              (my_offer && best_offer.data.participant_id==my_offer.data.participant_id))
          {
            leading_offer += best_offer.data.participant+'<br/>';
          }
          leading_offer+= Ext.util.Format.formatPrice(best_offer.data.price, null, this.procedure.currency_vocab_short) +'<br/>'+
                          Ext.util.Format.localDateRenderer(last_offer_time);
          var diff = Math.round(1000*(this.lot.start_price-best_offer.data.price)/this.lot.start_price)/10;
          if (diff<0) {
            diff = -diff;
          }
          Ext.getCmp(this.ids.current_diff).setValue(diff+'%');
          if (this.procedure.procedure_type == Application.models.Procedure.type_ids.auction_up || this.procedure.procedure_type == Application.models.Procedure.type_ids.auction_up_26) {
            Ext.get(this.ids.lot_direction_text).update('повышение');
          }
          Ext.getCmp(this.ids.current_price).setValue(Ext.util.Format.price(best_offer.data.price, null, this.procedure.currency_vocab_short));
        } else {
          if (component.lot && !component.procedure.price_reduction) {
            last_offer_time = component.lot.date_begin_auction;
            Ext.getCmp(this.ids.current_price).setValue(Ext.util.Format.price(component.lot.start_price, null, component.procedure.currency_vocab_short));
          }
        }
        if (my_offer) {
          Ext.getCmp(this.ids.my_last_offer).setValue(Ext.util.Format.formatPrice(my_offer.data.price, null, this.procedure.currency_vocab_short).replace(/ /g, '&nbsp;')
                                                      , true);
        }
        this.myPosition = (this.offersRanges&&this.offersRanges.my_place)?this.offersRanges.my_place:this.getMyPosition();
        Ext.getCmp(this.ids.my_position).setValue(this.myPosition||'-');
        var leader_hint = Ext.getCmp(this.ids.disable_offers_hint);
        var price_hint = Ext.getCmp(this.ids.price_hint);
        var price_hint_notbest = Ext.getCmp(this.ids.price_hint_notbest);
        var input_offer_row = Ext.getCmp(this.ids.input_offer_row);

        var disableOffers = function(reason) {
          if (!this.is_participant) {
            return;
          }
          input_offer_row.disable();
          if (price_hint.isVisible()) {
            price_hint.hide();
          }
          if (price_hint_notbest.isVisible()) {
            price_hint_notbest.hide();
          }
          leader_hint.update(reason);
          if (!leader_hint.isVisible()) {
            leader_hint.show();
            this.doLayout();
          }
        }
        var enableOffers = function() {
          input_offer_row.enable();
          if (leader_hint.isVisible()) {
            leader_hint.hide();
          }
          if (!price_hint.isVisible()) {
            price_hint.show();
            this.doLayout();
          }
        }

        var current_price = this.lot.start_price;
        if (best_offer) {
          current_price = best_offer.data.price;
        }
        var current_supplier_price = (my_offer?my_offer.data.price:this.lot.start_price);

        this.rangeCheck.notbestMax = null;
        this.rangeCheck.notbestMin = null;
        this.rangeCheck.max = null;
        this.rangeCheck.min = null;

        if (this.offersRanges && !this.offersRanges.can_trade) {
          disableOffers.call(this, this.offersRanges.message||'Внутренняя ошибка: невозможно подавать ценовые предложения');
        } else if (this.offersRanges) {
          this.rangeCheck.max = this.offersRanges.max;
          this.rangeCheck.min = this.offersRanges.min;
          this.rangeCheck.notbestMax = this.offersRanges.max_notbest;
          this.rangeCheck.notbestMin = this.offersRanges.min_notbest;
          enableOffers.call(this);
          this.updateRanges();
        } else if (1==this.myPosition) {
          disableOffers.call(this, 'Пока ваше предложение лидирует, вы не можете подавать ценовые предложения');
        } else if (this.is_stopping && !best_offer) {
          // нет ценовых предложений, а основное время торгов вышло
          disableOffers.call(this, 'При отсутствии ценовых предложений доподача невозможна');
        } else if (this.is_stopping) {

          if (this.getDirection()>0) { // повышение
            this.rangeCheck.max = current_price;
            this.rangeCheck.min = current_supplier_price+0.01;
          } else {
            this.rangeCheck.max = current_supplier_price-0.01;
            this.rangeCheck.min = current_price;
          }
          if (this.rangeCheck.max>=this.rangeCheck.min) {
            enableOffers.call(this);
            this.updateRanges();
          } else {
            disableOffers.call(this, 'Нет допустимого диапазона для ценовых предложений');
          }
        } else {
          enableOffers.call(this);
          var step_min;
          var step_max;
          if (this.procedure.step_is_exact) {
            step_min = this.procedure.offers_step_min;
            step_max = this.procedure.offers_step_max;
          } else {
            step_min = (this.lot.start_price * this.procedure.offers_step_min)/100;
            step_max = (this.lot.start_price * this.procedure.offers_step_max)/100;
          }
          if (step_min<0.01) {
            step_min = 0.01;
          }
          if (step_max<0.01) {
            step_max = 0.01;
          }
          if (this.getDirection()<0) {
            // торги на понижение, соответственно шаги в минус
            var t = step_min;
            step_min = -step_max;
            step_max = -t;
          }
          this.rangeCheck.min = Math.round(100*current_price+100*step_min)/100;
          this.rangeCheck.max = Math.round(100*current_price+100*step_max)/100;
          if (this.rangeCheck.min <= this.minimumTradeOffer) {
            this.rangeCheck.min = this.minimumTradeOffer;
          }
          if (this.rangeCheck.max <= this.minimumTradeOffer) {
            this.rangeCheck.max = this.minimumTradeOffer;
          }
          if (Main.config.allow_notbest_offers && current_price!=this.lot.start_price && current_supplier_price!=current_price) {
            // если вообще возможно подаваться на второе место
            if (this.getDirection()>0) { // повышение
              this.rangeCheck.notbestMax = current_price;
              this.rangeCheck.notbestMin = current_supplier_price+0.01;
              if (0==this.rangeCheck.notbestMin) {
                this.rangeCheck.notbestMin += 0.01;
              }
            } else {
              this.rangeCheck.notbestMax = current_supplier_price-0.01;
              this.rangeCheck.notbestMin = current_price;
              if (0==this.rangeCheck.notbestMax) {
                this.rangeCheck.notbestMax -= 0.01;
              }
            }
            if (this.rangeCheck.notbestMax<this.rangeCheck.notbestMin) {
              this.rangeCheck.notbestMax = null;
              this.rangeCheck.notbestMin = null;
            }
          }
          this.updateRanges();
        }

        if (this.offersRanges) {
          this.dateEndAuction = this.offersRanges.end_trade;
        } else if (last_offer_time) {
          this.dateEndAuction = new Date();
          if (last_offer_time<this.lot.date_begin_auction) {
            last_offer_time = this.lot.date_begin_auction;
          }
          if (best_offer) {
            this.dateEndAuction.setTime(last_offer_time.getTime()+this.procedure.offers_wait_time*60000);
          } else {
            this.dateEndAuction.setTime(last_offer_time.getTime()+this.procedure.first_offer_wait_time*60000);
          }
        } else {
          this.dateEndAuction = null;
        }
        Ext.getCmp(this.ids.time_left_estimated).setValue(Ext.util.Format.localDateRenderer(this.dateEndAuction), true);
        Ext.getCmp(this.ids.best_offer).update(leading_offer);

        var offers_step_hint_cmp = Ext.get(this.ids.offers_step_hint);
        if (offers_step_hint_cmp ) {
          var str = ''
          if (this.procedure.procedure_type == Application.models.Procedure.type_ids.public_sale) {
            Ext.getCmp(this.ids.price_hint).hide();
            if (this.procedure.status_reduction == "TRADE_STATUS_PRICE_AUC") {
              /// Есть ЦП
              if (best_offer) {
                var offers_step_cur = parseInt(this.procedure.step_auction);
                str = 'Возможные предложения о цене лота при повышении текущей цены на ' +
                      'величину, равную либо кратную величине "шага аукциона": ' +
                      (best_offer.data.price + offers_step_cur) + ', ' +
                      (best_offer.data.price + 2 * offers_step_cur) + ', ' +
                      (best_offer.data.price + 3 * offers_step_cur) + ', …';
              }
            }
            /// Нет ЦП либо одна ЦП
            if (Ext.getCmp(this.ids.offers_count).value < 2) {
              if ((this.procedure.status_reduction == undefined || this.procedure.status_reduction == "TRADE_STATUS_RUNNING") &&
                  !my_offer) {
                str = 'В течение одного часа со времени начала проведения процедуры аукциона участникам предлагается заявить о приобретении имущества по начальной цене';
              }
            }
          }

          offers_step_hint_cmp.update(str);
        }

        if (this.isRunning) {
          Ext.TaskMgr.stop(this.auctionPollTask);
          this.in_update = false;
          Ext.TaskMgr.start(this.auctionPollTask);
        }

        this.initChart();
        this.updateHeartBeat();
      },
      scope: this
    });

    Application.components.Trade.superclass.initComponent.call(this);
  },
  addOffer: function(offer) {
    var error = false;
    var of_ = parsePrice(offer.price);

    function checkRange(v, min, max) {
      var error = false;
      if (null!==min && Math.abs(v)-min<-0.001) {
        error = 'Ваше предложение ниже допустимого ('+Ext.util.Format.price(min)+')';
      } else if (null!==max && Math.abs(v)-max>0.001) {
        error = 'Ваше предложение выше допустимого ('+Ext.util.Format.price(max)+')';
      }
      return error;
    }

    function checkStep(v, start_price, step_cur, cur) {
      var error = false;
      var delta = Math.round(100 * (v - start_price)) / 100;
      if (delta % step_cur < 0.001 || (step_cur - delta % step_cur) < 0.001)
        return error;
      var val = Ext.util.Format.price(step_cur, null, cur)
      return 'Цена имущества не соответствует увеличению текущей цены на величину ' + val +
             ' либо кратную величине ' + val;
    }

    var time = lz(Math.floor((getServerTime() - this.lot.date_begin_auction) / 60)) / 1000;
    if ( this.procedure.procedure_type != Application.models.Procedure.type_ids.public_sale) {
      if (false===of_) {
        error = 'Не удалось понять ваше предложение. Используйте число, отделяя десятичные знаки запятой или точкой, и разделяя тысячи (если нужно) пробелами';
      } else if (of_<0) {
        error = 'Ваше предложение отрицательно, что не допустимо';
      } else if (Math.abs(of_)<0.001) {
        error = 'Ваше предложение равно нулю, что не допустимо';
      } else {
        error = checkRange(of_, this.rangeCheck.min, this.rangeCheck.max);
        if (error && Main.config.allow_notbest_offers
            && this.rangeCheck.notbestMin && !this.rangeCheck.notbestMax
            && checkRange(of_, this.rangeCheck.notbestMin, this.rangeCheck.notbestMax))
        {
          error += ', также предложение не попадает в дополнительный диапазон';
        } else {
          error = false;
        }
      }
    }
    else {
      var best_offer = this.getExpensiveOffer();
      var cur_price = best_offer ? best_offer.data.price : this.lot.start_price;
      var offers_step_cur = parseInt(this.procedure.step_auction);

      if (false===of_) {
        error = 'Не удалось понять ваше предложение. Используйте число, отделяя десятичные знаки запятой или точкой, и разделяя тысячи (если нужно) пробелами';
      }else if (of_<0) {
        error = 'Ваше предложение отрицательно, что не допустимо';
      }else if (Math.abs(of_)<0.001) {
        error = 'Ваше предложение равно нулю, что не допустимо';
      }else if ( typeof this.procedure.status_reduction == "undefined" || this.procedure.status_reduction == "TRADE_STATUS_RUNNING" || this.procedure.status_reduction == "TRADE_STATUS_PRICE_DOWN" ) {
        if ( this.procedure.status_reduction == "TRADE_STATUS_PRICE_DOWN"){
          if (of_ != cur_price) {
            error = 'На этом этапе участникам предлагается заявить о приобретении имущества по текущей цене';
          }
        }else if ( of_ > cur_price) {
          error = 'В течение одного часа со времени начала проведения процедуры аукциона участникам предлагается заявить о приобретении имущества по начальной цене';
        } else if ( of_ < cur_price) {
          error = 'Ваше предложение меньше текущей цены, что не допустимо';
        }
        if ( typeof this.procedure.status_reduction == "undefined"){
          error = 'Нет информации о статусе торгов !';
        }
      }else if (of_ < cur_price) {
        var offers_step_cur_str = Ext.util.Format.price(offers_step_cur, null, this.procedure.currency_vocab_short)
        error = 'Цена имущества не соответствует увеличению текущей цены на величину ' + offers_step_cur_str +
          ' либо кратную величине ' + offers_step_cur_str;
      }else if (of_ == cur_price) {
        error = 'Предложение о цене имущества не может быть принято в связи с подачей аналогичного предложения ранее другим участником';
      }
      else {
        error = checkStep(of_, cur_price, offers_step_cur, this.procedure.currency_vocab_short);
      }
    }


    if (error) {
      Ext.Msg.alert('Ошибка', error);
      return;
    }

    var data = {
      lot_id: this.lot.id,
      applic_id: this.application.id,
      direction: offer.direction,
      lot: this.lot.number,
      procedure: this.procedure.registry_number,
      time: now(),
      price: of_
    };
    if ('none'!=Main.eds.mode) {
      data.signature = signData(getTradeOfferTemplate().apply(data), 1);
      if (!checkSignatureResult(data.signature)) {
        return;
      }
    }
    var params = {
      mask: true,
      //wait_disable: true,
      wait_text: 'Подаем предложение...',
      //handle_failure: true,
      scope: this,
      mask_el: Ext.getBody()//getViewEl()
    };
    Ext.TaskMgr.stop(this.offersCheckTask);
    performRPCCall(RPC.Offer.submit, [data], params, function(resp){
      Ext.TaskMgr.start(this.offersCheckTask);
      echoResponseMessage(resp);
      Ext.getCmp(this.ids.input_offer).reset();
    });
  },
  startPoll: function() {
    Ext.TaskMgr.start(this.auctionPollTask);
    Ext.TaskMgr.start(this.offersCheckTask);
  },
  setError: function(text) {
    var error = Ext.getCmp(this.ids.error_panel);
    var error_text = Ext.getCmp(this.ids.error_panel_text);
    error.show();
    error_text.update(text.escapeHtml());
  },
  hideError: function() {
    var panel = Ext.getCmp(this.ids.error_panel);
    if (panel) {
      panel.hide();
    }
  },
  setValues: function(procedure) {
    this.procedure = procedure;
    var allowed_types = Application.models.Procedure.groups.auctions;
    var public_sales = Application.models.Procedure.groups.public_sale;
    if (allowed_types.indexOf(procedure.procedure_type) < 0 && public_sales.indexOf(procedure.procedure_type) < 0) {
      this.setError('Электронные торги по процедурам этого типа не предусмотрены.');
      return false;
    }
    if (procedure.lot) {
      this.lot = procedure.lot;
    } else if (procedure.lots && procedure.lots[0]) {
      this.lot = procedure.lots[0];
      this.lot_id = this.lot.id;
      this.offers_store.setBaseParam('lot_id', this.lot_id);
    } else {
       this.setError('У процедуры нет лотов, продолжение невозможно');
       return false;
    }
    if (!this.getDirection()) {
      this.setError('Внутренняя ошибка: невозможно определить направление торгов.');
      return false;
    }
    procedure.trade_type = 'Аукцион';
    if (procedure.procedure_type == Application.models.Procedure.type_ids.auction_down) {
      procedure.trade_type = 'Редукцион';
    } else if (procedure.procedure_type == Application.models.Procedure.type_ids.peretorg_reduc) {
      procedure.trade_type = 'Переторжка';
    }
    this.lot.date_begin_auction = parseDate(this.lot.date_begin_auction);
    if (Main.config.allow_single_unit && this.lot.single_unit && this.lot.unit_price) {
      this.lot.full_price = Number(this.lot.start_price);
      this.lot.start_price = this.lot.unit_price;
    }
    this.lot.start_price = Number(this.lot.start_price);
    this.procedure.offers_wait_time = Number(this.procedure.offers_wait_time);
    this.procedure.first_offer_wait_time = Number(this.procedure.first_offer_wait_time);
    if (!this.procedure.first_offer_wait_time) {
      this.procedure.first_offer_wait_time = this.procedure.offers_wait_time;
    }
    this.procedure.offers_step_min = Number(this.procedure.offers_step_min);
    this.procedure.offers_step_max = Number(this.procedure.offers_step_max);
    Ext.getCmp(this.ids.start_price).setValue(Ext.util.Format.formatPrice(this.lot.start_price, null, procedure.currency_vocab_short));
    this.start_price = this.lot.start_price;

    if (procedure.procedure_type == Application.models.Procedure.type_ids.public_sale) {
      var offers_step_cur = procedure.step_auction;
      Ext.getCmp(this.ids.step_reduction).setValue(Ext.util.Format.price(procedure.step_reduction, null, this.procedure.currency_vocab_short));
    } else{
      var offers_step_cur = this.lot.start_price * procedure.offers_step_value / 100;
      Ext.getCmp(this.ids.step_reduction).hide();
    }

    Ext.getCmp(this.ids.offers_step).setValue(Ext.util.Format.price(offers_step_cur, null, this.procedure.currency_vocab_short));

    this.setTitle(String.format('{4}: {0} лот {1}: {2} ({3})', procedure.registry_number, this.lot.number, procedure.title, this.lot.subject, procedure.trade_type));
    return true;
  },
  showParticipantFields: function(show) {
    var fields = ['my_last_offer', 'my_position', 'new_offer'];
    for (var i=0; i<fields.length; i++) {
      var f = Ext.getCmp(this.ids[fields[i]]);
      if (f) {
        if (false!==show) {
          f.show();
        } else {
          f.hide();
        }
      }
    }
    this.doLayout();
    if (false!==show) {
      Ext.getCmp(this.ids.input_currency).update(this.procedure.currency_vocab_short);
    }
  },
  loadData: function(silent) {
    var params = {
      mask: true,
      wait_disable: silent,
      wait_text: 'Загружаются параметры лота',
      //handle_failure: true,
      scope: this,
      mask_el: getViewEl()
    };
    var loadFn = RPC.Lot.load;
    var loadparams = {lot_id: this.lot_id,
                      procedure_id: this.procedure_id,
                      check_finished: true};
    if (this.procedure_id && !this.lot_id) {
      loadFn = RPC.Procedure.load;
    }
    performRPCCall(loadFn, [loadparams], params, function(resp){
      if (!resp || !resp.success) {
        this.setError(resp.msg||resp.message||'Ошибка загрузки данных процедуры');
        return;
      }
      if (!this.setValues(resp.procedure)) {
        return;
      }
      if (resp.is_finished) {
        this.fireEvent('auctionstop');
        return;
      }
      this.setStopping(resp.is_stopping, false);
      if (false!==this.no_participant_text) {
        this.fireEvent('loaded');
        return;
      }
      params.wait_text = 'Загружается заявка';
      performRPCCall(RPC.Applic.loadByLot, [this.lot_id], params, function(resp){
        if (!resp.success) {
          this.setError(resp.msg||resp.message||'Ошибка загрузки данных заявки');
          return;
        }
        if (!resp.application || !resp.application.date_accepted || 3!=resp.application.status ||
            (resp.application.date_rejected && resp.application.reject_stage && resp.application.reject_stage != 2) )
        {
          this.is_participant = false;
          this.no_participant_text = 'Вы не можете участвовать в торгах, т.к. вы не подавали заявок на этот лот, либо ваша заявка не была допущена.';
        } else {
          //@TODO: проверка статуса заявки
          this.is_participant = true;
          this.application = resp.application;
          this.offers_store.setBaseParam('applic_id', resp.application.id);
        }
        this.fireEvent('loaded');
      });
    });
  },
  waitForStartTask: {
    interval: 250,
    run: function(cnt) {
      var now = getServerTime();
      if (this.lot.date_begin_auction && this.lot.date_begin_auction<=now) {
        this.getEl().unmask();
        Ext.TaskMgr.stop(this.waitForStartTask);
        this.fireEvent('auctionstart');
      } else {
        var str = '<p>Начало торгов: ';
        if (this.lot.date_begin_auction) {
          if (5!=this.lot.status && false!==this.last_wait_diff) {
            this.getEl().mask('<p>Процедура не в статусе торгов</p>');
            this.last_wait_diff = false;
            return;
          }
          if (5!=this.lot.status) {
            return;
          }
          var diff;
          if (now) {
            diff = Math.round((this.lot.date_begin_auction-now)/1000);
          } else {
            diff = null;
          }
          if (this.last_wait_diff && diff==this.last_wait_diff) {
            return;
          }
          if (cnt>(1000/this.waitForStartTask.interval)*60*1) {
            // каждые 5 минут перечитываем заявки и т.п., мало ли время изменилось
            Ext.TaskMgr.stop(this.waitForStartTask);
            this.loadData(true);
          }
          this.last_wait_diff = diff;
          var diff_str = '';
          if (now) {
            diff_str = '<p>Торги начнутся через: <b'+(diff<5*60?' class="red"':'')+'>'+Ext.util.Format.formatInterval(diff)+'</b>';
          }
          str += '<b>'+Ext.util.Format.localDateRenderer(this.lot.date_begin_auction)+'</b></p>\n'+diff_str;
        } else {
          str += '<b class="highlight">не назначено</b>';
        }
        this.getEl().mask('<p>Торги еще не начались, дождитесь начала торгов</p>\n'+str+'</p>');
      }
    }
  },
  offersCheckTask: {
    interval: 10000,
    run: function() {
      var component = this;
      if (!this.lot || this.in_update) {
        return;
      }
      this.in_update = true;
      RPC.Offer.getLast(this.lot.id, function(resp) {
        if (!component || component.isDestroyed || component.destroying || !component.offers_store) {
          return;
        }
        component.in_update = false;
        if (!resp) {
          component.setError('Ошибка связи с сервером, если это сообщение не пропадет через 30 секунд — перезагрузите страницу.');
          return;
        }
        if (resp.success) {
          component.hideError();
          if (resp.is_finished) {
            component.fireEvent('auctionstop');
            return;
          }
          var need_update = component.is_stopping!=resp.is_stopping;
          component.setStopping(resp.is_stopping);
          if (!need_update) {
            var last_id = false;
            if (component.offersRanges && component.offersRanges.last_offer) {
              last_id = component.offersRanges.last_offer;
            } else {
              component.offers_store.each(function(r) {
                if (!last_id || r.data.id>last_id) {
                  last_id = r.data.id;
                }
              });
            }
            need_update = last_id != resp.offer_id;
          }
          component.updateHeartBeat();
          if (need_update) {
            component.offers_store.reload();
          }

          if (component.procedure.procedure_type == Application.models.Procedure.type_ids.public_sale) {
            component.dateEndAuction = resp.deadline;
            component.procedure.status_reduction = resp.status_reduction;
            var a2 = component.getMyPosition000(component);
            if (a2 > 0){
              component.myPosition = a2;
              Ext.getCmp(component.ids.my_position).setValue(component.myPosition||'-');
            }
            if (resp.price_reduction > 0){
//                var old_price = Ext.getCmp(component.ids.start_price).getValue();
              var old_price = Ext.getCmp(component.ids.current_price).getValue();
              var new_price = Ext.util.Format.formatPrice(resp.price_reduction, null, 'RUB');
              if ("" != resp.price_reduction && old_price != new_price ){
//                    Ext.getCmp(component.ids.start_price).setValue(Ext.util.Format.formatPrice(resp.price_reduction, null, 'RUB'));
                var best_price = component.getBestOffer(this);
                if (best_price && best_price.data.price){
                  best_price = best_price.data.price;
                }else{
                  best_price = resp.price_reduction;
                }
                Ext.getCmp(component.ids.current_price).setValue(Ext.util.Format.formatPrice(best_price, null, 'RUB'));
                component.lot.start_price = resp.price_reduction;
                component.procedure.price_reduction = resp.price_reduction;
                component.procedure.date_reduction = resp.date_reduction;

                /// Выдаем сообщение только если с момента снижения цены прошло не более 10 секунд (до окончания 14:50 = 890000)
                //if (resp.deadline - new Date() >= 890000) {
                if ( component.procedure.status_reduction != "TRADE_STATUS_PRICE_AUC" ) {
                  component.reductionChangePriceWindow.showSingle("<div style='font-size: 13px;padding: 8px; color: #305466;'>Начальная цена снижена на «шаг понижения», текущая цена: " + new_price +"</div>");
                }
              }
            }
          }
        }
      });

      /// Lion 2014.04.22 После 10 секунд работы таймер останавливается по непонятным причинам
      /// Эта строчка помогает ему работать дальше
      Ext.getCmp(this.ids.offers_grid).getStore().reload();
    }
  },
  auctionPollTask: {
    interval: 1000,
    run: function() {
      var now = getServerTime();
      if (!now) {
        return;
      }

      /// Публичное предложение
      if (this.procedure.procedure_type == Application.models.Procedure.type_ids.public_sale) {
        var leader_hint = Ext.getCmp(this.ids.disable_offers_hint);
        var price_hint = Ext.getCmp(this.ids.price_hint);
        var input_offer_row = Ext.getCmp(this.ids.input_offer_row);
        var price_hint_notbest = Ext.getCmp(this.ids.price_hint_notbest);

        var enableOffers = function() {
          input_offer_row.enable();
          if (leader_hint.isVisible()) {
            leader_hint.hide();
          }
          if (!price_hint.isVisible()) {
            price_hint.show();
            this.doLayout();
          }
        }

        var disableOffers = function(reason) {
          input_offer_row.disable();
          if (price_hint.isVisible()) {
            price_hint.hide();
          }
          if (price_hint_notbest.isVisible()) {
            price_hint_notbest.hide();
          }
          if (leader_hint.isVisible())
            leader_hint.update(reason);
          if (!leader_hint.isVisible()) {
            leader_hint.show();
            this.doLayout();
          }
        }

        var timebegin0 = this.lot.date_begin_auction;
        var timebegin = new Date(timebegin0).getTime();
        var now0 = new Date();
        var hour1st0 = timebegin + ( this.procedure.offers_wait_time * 60 ) *1000 ;

        var my_offer = this.getMyBestOffer();
        if (my_offer && Ext.getCmp(this.ids.offers_count).value < 2){
          if ( now0 < hour1st0  ){
            disableOffers.call(this,'Вы уже подали своё ЦП. Ждите пока подадут остальные участники или пройдёт час с начала торгов');
          }
          else {
            var my_off_date = new Date(my_offer.data.date_added).getTime();
            if ( my_off_date < hour1st0 ){
              enableOffers.call(this);
            }

            if ( this.myPosition == 1 ){
              disableOffers.call(this,'Вы уже подали своё ЦП. Ждите пока кто-нибудь подаст ЦП лучше Вашего или закончатся торги.');
            }else{
              enableOffers.call(this);
            }
          }
          if (Ext.getCmp(this.ids.offers_count).value == 1) {
            disableOffers.call(this,'Ваше предложение является лидирующим. В случае если в оставшееся до окончания торгов время другими участниками будет сделано аналогичное предложение, процедура торгов перейдет в стадию аукциона.');
          }
        }
        if (Ext.getCmp(this.ids.offers_count).value == 2 &&
          this.procedure.procedure_type == Application.models.Procedure.type_ids.public_sale &&
          this.procedure.status_reduction != "TRADE_STATUS_PRICE_AUC") {
          disableOffers.call(this,'Вы уже подали своё ЦП. Ждите пока начнется аукцион.');
        }

        var best_offer = this.getLeadingOffer();
        var cur_price = best_offer ? best_offer.data.price : this.lot.start_price;
        var diff = Math.abs(Math.round(100 * (this.start_price - cur_price) / this.start_price));
        Ext.getCmp(this.ids.current_diff).setValue(diff + '%');

        if ( typeof cou == 'undefined') cou = 0;

        var offers_count = Ext.getCmp(this.ids.offers_count).value;
//            if ( hour1st0 <= now0 && cnt > 1 ) {
        if ( this.procedure.status_reduction == "TRADE_STATUS_PRICE_AUC" ) {
          Ext.getCmp(this.ids.time_left).fieldLabel = 'Времени до окончания';
          if (best_offer && this.start_price < best_offer.data.price)
            Ext.get(this.ids.lot_direction_text).update('повышение');
          else
            Ext.get(this.ids.lot_direction_text).update('снижение');
          if (cou == 0){
            cou++;
            this.reductionChangePriceWindow.showSingle("<div style='font-size: 13px;padding: 8px; color: #305466;'>Процедура перешла на этап проведения аукциона.</div>");
          }
        }
        else { /// Торги только начались или идут на понижение
          /// Нет ЦП
          if (offers_count == 0)
            Ext.getCmp(this.ids.time_left).fieldLabel = 'Времени до снижения цены на "шаг понижения"';
          else if (offers_count == 1)
            Ext.getCmp(this.ids.time_left).fieldLabel = 'Времени до окончания';
          else if (offers_count > 1)
            Ext.getCmp(this.ids.time_left).fieldLabel = 'Времени до начала аукциона';
        }
      }

      if (this.dateEndAuction) {
        var time_left = this.dateEndAuction-now;
        if (this.is_stopping && !this.offersRanges) {
          var t = Number(Main.config.allow_stopped_offers);
          if (1==t) {
            t = this.procedure.offers_wait_time;
          }
          time_left += t*60000;
        }
        var time_left_str = '';
        if (time_left>=0) {
          time_left_str = Ext.util.Format.digitalInterval(time_left, true);
        } else if (time_left>-30000) {
          time_left_str = 'ожидаем подтверждение завершения';
        } else {
          time_left_str = 'Подтверждения завершения нет уже '+Ext.util.Format.digitalInterval(-time_left, true)+' обновите страницу';
        }
        Ext.getCmp(this.ids.time_left).setValue(time_left_str);
        Ext.getCmp(this.ids.trade_duration).setValue(Ext.util.Format.digitalInterval(now-this.lot.date_begin_auction, true));
        Ext.getCmp(this.ids.progress).updateProgress(1-time_left/(this.procedure.offers_wait_time*60000));
        this.checkHeartBeat();
      }
    }
  },
  initChart: function() {
    if (this.chart) {
      return;
    }
    var chart = Ext.getCmp(this.ids.offers_chart);
    var component = this;
    this.chart = new Ext.chart.LineChart({
      xtype: 'linechart',
      store: this.offers_store,
      xField: 'date_added',
      yField: 'price',
      cls: 'thinborder',
      yAxis: new Ext.chart.NumericAxis({
        displayName: 'Цена',
        labelRenderer : function(v) {return Ext.util.Format.formatPrice(v, {decimalPrecision: 0});}
      }),
      xAxis: new Ext.chart.TimeAxis({
        labelRenderer : Ext.util.Format.dateRenderer('H:i')
      }),
      tipRenderer : function(chart, record){
        var currency = null;
        if (component.procedure) {
          currency = component.procedure.currency_vocab_short;
        }
        return record.data.participant+'\n'+
               Ext.util.Format.formatPrice(record.data.price, null, currency)+'\n'+
               Ext.util.Format.date(record.data.date_added, 'd.m.Y H:i:s');
      }
    });
    chart.add(this.chart);
    chart.doLayout();
  },

  /**
   * Возвращает направление аукциона (изначальное).
   * @return 1: на повышение, -1 на понижение
   */
  getDirection: function() {
    if (this.procedure.procedure_type == Application.models.Procedure.type_ids.auction_up ||
        this.procedure.procedure_type == Application.models.Procedure.type_ids.auction_up_26 ||
        this.procedure.procedure_type == Application.models.Procedure.type_ids.public_sale) {
      return 1;
    } else if (this.procedure.procedure_type == Application.models.Procedure.type_ids.auction_down ||
               this.procedure.procedure_type == Application.models.Procedure.type_ids.peretorg_reduc)
    {
      return this.lot.reversed?1:-1;
    }
    return false;
  },

  /**
   * Сравнивает два оффера
   * @param of1 первый оффер
   * @param of2 второй оффер
   * @return -1 если 1й оффер хуже второго, 1 если лучше и 0 если это один и тот же оффер
   */
  compareOffers: function(of1, of2) {
    if (of1.id == of2.id) { // если предложение одно и то же
      return 0;
    }
    if (of1.price == of2.price // если предложения равны и по цене и по направлению
        && (of1.reversed&&of2.reversed || !of1.reversed&&!of2.reversed)
       )
    {
      // раньше == лучше
      if (of1.date_added.getTime()==of2.date_added.getTime()) { // если равно еще и время, сравниваем по id
        return of1.id<of2.id?1:-1;
      } else {
        return of1.date_added<of2.date_added?1:-1; // или сравниваем по дате
      }
    }
    if (this.getDirection()>0) {
      // у кого больше тот лучше
      return of1.price>of2.price?1:-1;
    } else {
      // развернувшийся оффер всегда лучше не развернувшегося
      if (of1.reversed && !of2.reversed) { // Если of1 развернулось, а of2 нет
        return 1;
      }
      if (!of1.reversed && of2.reversed) { // Если of1 не развернулось, а of2 развернулся
        return -1;
      }
      // у кого меньше тот лучше
      return of1.price<of2.price?1:-1;
    }
  },

  getSortFn: function() {
    return this.compareOffers.createDelegate(this);
  },
  getReverseSortFn: function() {
    return (function(o1, o2) {
      var c = this.compareOffers(o1, o2);
      return -c;
    }).createDelegate(this);
  },

  getLeadingOffer: function() {
    var record = null;
    var dir = this.getDirection();
    var self = this;
    if (this.offers_store) {
      this.offers_store.each(function(r) {
        if (!record) {
          record = r;
        } else if (self.compareOffers(r.data, record.data)>0) {
          record = r;
        }
      });
    }
    return record;
  },
  getExpensiveOffer: function() {
    var record = null;
    var dir = this.getDirection();
    var self = this;
    if (this.offers_store) {
      this.offers_store.each(function(r) {
        if (!record) {
          record = r;
        } else if (self.compareOffers(r.data, record.data)>0) {
          record = r;
        }
      });
    }
    return record;
  },
  getMyPosition: function() {
    var offers = [];
    if (!Main.contragent) {
      return null;
    }
    // чтобы не гадить основной стор, делаем его копию в массивчик
    this.offers_store.each(function(r) {
      offers.push(r.data);
    });
    offers.sort(this.getReverseSortFn());
    var positions = [];
    for (var i=0; i<offers.length; i++) {
      if (offers[i].participant_id==Main.contragent.id) {
        return positions.length+1;
      } else if (positions.indexOf(offers[i].participant_id)<0) {
        positions.push(offers[i].participant_id);
      }
    }
    return null;
  },
  getMyPosition000: function() {
    var offers = [];
    if (!Main.contragent) {
      return null;
    }
    // чтобы не гадить основной стор, делаем его копию в массивчик
    this.offers_store.each(function(r) {
      offers.push(r.data);
    });
//    offers.sort(this.getReverseSortFn());
    var positions = [];
    for (var i=0; i<offers.length; i++) {
      if (offers[i].participant_id==Main.contragent.id) {
        return positions.length+1;
      } else if (positions.indexOf(offers[i].participant_id)<0) {
        positions.push(offers[i].participant_id);
      }
    }
    return null;
  },
  getMyBestOffer: function() {
    var cmp = this;
    if (!this.is_participant) {
      return null;
    }
    var my_offer = null;
    this.offers_store.each(function(r){
      if (r.data.participant_id != Main.contragent.id) {
        return;
      }
      if (!my_offer || cmp.compareOffers(r.data, my_offer.data)>0) {
        my_offer = r;
      }
    });
    return my_offer;
  },
  getBestOffer: function() {
    var cmp = this;
    if (!this.is_participant) {
      return null;
    }
    var best_offer = null;
    this.offers_store.each(function(r){
      if (!best_offer || ( r.data.price > best_offer.data.price) ) {
        best_offer = r;
      }
    });
    return best_offer;
  },
  setOfferPrice: function(price) {
    price = price.replace(/[^\d,.]+/g, '');
    price = price.replace(/,/g, '.');
    Ext.getCmp(this.ids.input_offer).setValue(price);
  },
  updateRanges: function() {
    var cmp;
    cmp = Ext.get(this.ids.avail_offers_from);
    if (cmp) {
      cmp.update(Ext.util.Format.formatPrice(this.rangeCheck.min, null, this.procedure.currency_vocab_short));
    }

    cmp = Ext.get(this.ids.avail_offers_for);
    if (cmp) {
      cmp.update(Ext.util.Format.formatPrice(this.rangeCheck.max, null, this.procedure.currency_vocab_short));
    }

    var offers_input = Ext.getCmp(this.ids.input_offer);
    var price_hint_notbest = Ext.getCmp(this.ids.price_hint_notbest);

    if (Main.config.allow_notbest_offers && this.rangeCheck.notbestMin && this.rangeCheck.notbestMax) {
      cmp = Ext.get(this.ids.avail_notbest_offers_from);
      if (cmp) {
        cmp.update(Ext.util.Format.formatPrice(this.rangeCheck.notbestMin, null, this.procedure.currency_vocab_short));
      }
      cmp = Ext.get(this.ids.avail_notbest_offers_for);
      if (cmp) {
        cmp.update(Ext.util.Format.formatPrice(this.rangeCheck.notbestMax, null, this.procedure.currency_vocab_short));
      }
      if (!price_hint_notbest.isVisible()) {
        price_hint_notbest.show();
      }
      offers_input.minValue = Math.min(this.rangeCheck.min, this.rangeCheck.notbestMin);
      offers_input.maxValue = Math.max(this.rangeCheck.max, this.rangeCheck.notbestMax);
    } else {
      if (price_hint_notbest.isVisible()) {
        price_hint_notbest.hide();
      }
      offers_input.minValue = this.rangeCheck.min;
      offers_input.maxValue = this.rangeCheck.max;
    }

    if (this.procedure.procedure_type == Application.models.Procedure.type_ids.public_sale) {
      offers_input.minValue = null;
      offers_input.maxValue = null;
    }
  },
  updateHeartBeat: function() {
    this.lastHeartBeat = (new Date()).getTime();
  },
  checkHeartBeat: function() {
    if (!this.lastHeartBeat) {
      return;
    }
    var local_now = (new Date()).getTime();
    var delay = local_now - this.lastHeartBeat;
    if (delay<0) {
      this.updateHeartBeat();
      return;
    }
    delay = Math.round(delay/1000.0);
    if (delay > 30) { // 30 сек
      this.setError('Проверьте свое подключение к сети Интернет! '+
                  'От сервера долгое время не поступало признаков активности. '+
                  'Последняя активность была примерно '+Ext.util.Format.formatInterval(delay)+' назад. '+
                  'Отображаемые в настоящий момент сведения о ценовых предложениях аукциона могут быть неактуальны. '+
                  'Если это сообщение не исчезнет в ближайшие 30 секунд — пожалуйста, перезагрузите страницу.');
    }
  },
  setStopping: function(is_stopping, updateranges) {
    if (undefined===updateranges) {
      updateranges = false;
    }
    if (is_stopping) {
      if (!this.is_stopping) {
        if (updateranges) {
          this.fireEvent('offersupdated');
        }
        Ext.Msg.alert('Предупреждение', 'Срок подачи предложений истек. Идет доподача...');
        this.setTitle(String.format('<span class="highlight-title">Период доподачи!</span> {4}: {0} лот {1}: {2} ({3})', this.procedure.registry_number, this.lot.number, this.procedure.title, this.lot.subject, this.procedure.trade_type));
      }
      this.is_stopping = true;
    } else {
      if (this.is_stopping) {
        if (updateranges) {
          this.fireEvent('offersupdated');
        }
        Ext.Msg.alert('Предупреждение', 'Доподача почему-то прекратилась и аукцион вернулся на основное время. Такого не должно происходить, случилось что-то непредвиденное.<br/>\n'+
                      'Рекомендуем <a href="javascript:window.location.reload();">перезагрузить страницу</a>.');
      }
      this.is_stopping = false;
    }
  }
});
