Ext.define('Application.components.UserProfile_mc', {
  extend: 'Ext.form.Panel',
  frame : false,
  border : false,
  initComponent : function () {
    var idTabPanel= Ext.id(),
        idTab1    = Ext.id(),
        idTab2    = Ext.id(),
        idTab3    = Ext.id(),

        idUrl     = Ext.id(),
        idStack   = Ext.id(),
        idCouStr  = Ext.id(),

        id_cou_days  = Ext.id(),
        id_start_price_hot  = Ext.id(),
        id_cou_applic  = Ext.id(),
        id_activity_area  = Ext.id(),
        id_activity_itemselect  = Ext.id(),

        id_notice_days    = Ext.id(),  // Просмотр уведомлений не старше (дней)
        id_notice_fav     = Ext.id(),  // Получение уведомлений по избранным процедурам
        id_notice_my      = Ext.id(),  // Получение уведомлений по моим процедурам
        id_notice_with_me = Ext.id(),  // Получение уведомлений по процедурам с моим участием
        id_notice_pereodic= Ext.id();  // Настройки периодичности формирования уведомлений с напоминанием о приближении срока изменения статуса лота в процедуре или о необходимости совершить действие

    var component = this;
		
			component.settings_store = new Ext.data.DirectStore({
      autoLoad: true,
      directFn: RPC.User.getUserSettingsMc,
      sortInfo: {
        field: 'id',
        direction: 'DESC'
      },
      baseParams: {
				pid:0
      },
      idProperty: 'id',
      totalProperty: 'totalCount',
      paramsAsHash: true,
//      remoteSort: true,
      root: 'rows',
      fields: [
				'id', 'value'
			],
      listeners: {
        exception: storeExceptionHandler,
				load:function( this0, records, options ){
//					console.log( this0, records, options );
					var index;
					var a = records;
					for (index = 0; index < a.length; ++index) {
							component.getForm().findField(a[index].data.id).setValue(a[index].data.value);
					}
				}
      }
    });
//component.settings_store.load(function() {
//        component.settings_store.each(function(record){
//            console.log(record.get('id'));
//        });
//    });
    var Tab1items = [
        {
          xtype: 'textfield',
          defaultType: 'textfield',
          id: idUrl,
          width:250,
          value: 'https://support.rosseltorg.ru',
//          value: component.settings_store.getById('server_url').get('value'),
          typeAhead: true,
          fieldLabel: 'Адрес сервера ТП',
					dataIndex:'server_url',
          name: 'server_url',
          allowBlank:false
        },
        {
          xtype: 'numberfield',
          id: idStack,
          fieldLabel: 'Глубина стека просмотренных процедур',
          width:50,
          allowNegative:false,
          value:50,
          name:'stack_deep',
          validator: function(val) {
            if (val>0) {
               return true;
            } else {
                return "Должно быть больше чем 0";
            }
          }
        },
        {
          xtype: 'numberfield',
          id: idCouStr,
          fieldLabel: 'Строк в наименовании процедуры в списке процедур',
          width:50,
          allowNegative:false,
          value:50,
          name:'cou_string',
          validator: function(val) {
            if (val> 0) {
               return true;
            } else {
                return "Должно быть больше чем 0";
            }
          }
        }
    ];

		var tree_id= Ext.id();
		var Tree0 = Ext.tree;
		
//----------- Перечень сфер деятельности -----------
		var tree = new Tree0.TreePanel({
				id: tree_id,
				animate:true, 
				loader: new Tree0.TreeLoader({
          directFn: function(n, cb){ RPC.User.listCategories({node: n}, {tree:0},cb);}
        }),
				enableDrag:true,
				autoScroll:true,
				autoWidth: true,
				height: 250,
				bodyStyle:'background-color:#FFFFFF; padding: 2px;',
				dropConfig: {appendOnly:true},
				listeners: {
            beforenodedrop : function( e ) {
								arr = e.target.childNodes;
								for (var i = 0, len = arr.length; i < len; i++) {
									if (arr[i].id == e.dropNode.id){
										return false;
									}
								}
								e.dropNode.checked = false;
								e.dropNode = new Ext.tree.TreeNode(e.dropNode); // send back a node
								e.dropNode.on('click', this.onClick, this, {
								single: true,
								delay: 100
								});
								return true;
            }
        }
		});
            
		// add a tree sorter in folder mode
		new Tree0.TreeSorter(tree, {folderSort:true});

		// set the root node
		var root = new Tree0.AsyncTreeNode({
				text: 'Доступные', 
				draggable:false, // disable root node dragging
				expanded: true,
				id:'0'
		});
		tree.setRootNode(root);

//----------- Выбранные сферы деятельности -----------
		var tree2 = new Tree0.TreePanel({
				animate:true,
				loader: new Tree0.TreeLoader({
          directFn: function(n, cb){RPC.User.listCategories({node: n}, {tree:1}, cb);}
        }),
				border: true,
				height: 250,
				autoScroll:true,
				enableDD:true,
				dropConfig: {appendOnly:true},
				tbar:[
						{
							text: 'Сохранить',
							handler:function(){
								if ( tree2.getRootNode().hasChildNodes()  ){
									arr = tree2.getRootNode().childNodes;
									for (var i = 0, len = arr.length; i < len; i++) {
										//console.log(arr[i].id);
									}
									Ext.Msg.alert('Информация', 'Не сохранено! Т.к. не доделан функционал !!!');
								}
								tree2.getRootNode().reload();
							}
						},
						{xtype: 'tbspacer', width: 15},
						'-',
						{xtype: 'tbspacer', width: 15},
						{	
							text: 'Удалить отмеченные элементы',
							handler:function(){
								if ( tree2.getRootNode().hasChildNodes()  ){
									var hasChecked = tree2.getRootNode().findChildBy(function(n) {
										if (n.attributes.checked == true) {
												return true;
										}
									});
									if (!hasChecked){
										Ext.Msg.alert('Ошибка удаления', 'Нечего удалять !<br /> <b>Нет отмеченных элементов !</b>');
										return true;
									}

									Ext.MessageBox.show({
											title:'Удалить отмеченные элементы?',
											msg: 'Вы уверенны, что необходимо удалить <br />отмеченные сферы деятельности поставщика ?',
											width:300,
											buttons: Ext.MessageBox.YESNO,
											fn: function(btn){
												if (btn == 'yes'){
													var killed = false;
													var arr = tree2.getRootNode().childNodes;
													for (var i = 0, len = arr.length; i < len; i++) {
														var node = tree2.getRootNode().findChildBy(function(n) {
																if (n.attributes.checked == true) {
																		return true;
																}
														});
														if (node){
															node.remove();
															killed = true;
														}
														if (killed){
															Ext.Msg.alert('Информация', 'Удалены отмеченные элементы!<br /> Для применения изменений нажмите "Сохранить" !!!');
														}
													}

												}
											},
											icon: Ext.MessageBox.QUESTION
									});

								}else{
									Ext.Msg.alert('Ошибка', 'Нечего удалять !');
								}
							}
						},
						{xtype: 'tbspacer', width: 15},
						'-',
						{xtype: 'tbspacer', width: 20},
						{
							text: 'Очистить',
							handler:function(e){ 
								tree2.getRootNode().removeAll();
							}
						}
					],
				listeners: {
            beforenodedrop : function( e ) {
								arr = e.target.childNodes;
								for (var i = 0, len = arr.length; i < len; i++) {
									if (arr[i].id == e.dropNode.id){
										Ext.Msg.alert('Ошибка', '<center><b>Cфера деятельности </b><br />'+  arr[i].text +'<br /><b>уже в списке !!!</b></center>');
										return false;
									}
								}

							e.dropNode.checked = false;
							e.dropNode = new Ext.tree.TreeNode(e.dropNode);
							e.dropNode.setTooltip( e.dropNode.text, 'Добавлено, но не сохранено:' );
							e.dropNode.setIcon( 'ico/message.png' );
							return true;
            }
        }
		});
            
		// add a tree sorter in folder mode
		new Tree0.TreeSorter(tree2, {folderSort:true});

		// add the root node
		var root2 = new Tree0.AsyncTreeNode({
				text: 'Уже добавленные', 
				draggable:false,
				expanded: true,
				id:'0'
		});
		tree2.setRootNode(root2);
            

    var Tab2items = [
        {
          xtype: 'numberfield',
          id: id_cou_days,
          fieldLabel: '«Горящие» процедуры -  осталось менее дней',
          width:50,
          allowNegative:false,
          value:10,
          name:'cou_days',
          validator: function(val) {
            if (val>0) {
               return true;
            } else {
                return "Должно быть больше чем 0";
            }
          }
        },
        {
          xtype: 'Application.components.priceField',
          id: id_start_price_hot,
          fieldLabel: '«Горящие» процедуры -  начальная цена ( руб.)',
          width:150,
          allowNegative:false,
          allowBlank:false,
          value:123456,
          name:'start_price_hot',
          validator: function(val) {
            var input = Ext.getCmp(id_start_price_hot);
            if (input.getValue()>999) {
               return true;
            } else {
                return "Должно быть больше чем 999";
            }
          }
        },
        {
          xtype: 'numberfield',
          id: id_cou_applic,
          fieldLabel: '«Горящие» процедуры -  заявок не более ',
          width:50,
          allowNegative:false,
          value:50,
          name:'cou_applic',
          validator: function(val) {
            if (val>0) {
               return true;
            } else {
                return "Должно быть больше чем 0";
            }
          }
        }, 
        {
					title: 'Сферы деятельности/интересов поставщика',
          xtype: 'panel',
					border: true,
																autoload:true,
          layout:'column',
					defaults: {
											xtype: 'panel',
											anchor: '100%',
											columns: 3,
											border: true,
											height: 250
					},
					items: [
								{
									columnWidth:0.5,
									xtype:'panel',
									border: true,
									items: tree
								},
								{
									xtype:'panel',
									border: true,
									width: 2,
									bodyStyle:'background-color:#99bbe8'
								},
								{
									columnWidth:0.5,
									xtype:'panel',
									border: true,
									items: tree2
								}
							]
        }
    ];

    var Tab3items = [
        {
          xtype: 'numberfield',
          id: id_notice_days,
          fieldLabel: 'Просмотр уведомлений не старше (дней)',
          width:50,
          allowNegative:false,
          value:5,
          name:'notice_days',
          validator: function(val) {
            if (val>0) {
               return true;
            } else {
                return "Должно быть больше чем 0";
            }
          }
        },
        {
          xtype: 'checkbox',
          id: id_notice_fav,
          fieldLabel: 'Получение уведомлений по избранным процедурам',
          width:150,
          allowNegative:false,
          value:250,
          name:'notice_fav'
        },
        {
          xtype: 'checkbox',
          id: id_notice_my,
          fieldLabel: 'Получение уведомлений по моим процедурам',
          width:150,
          allowNegative:false,
          value:250,
          name:'notice_my'
        },
        {
          xtype: 'checkbox',
          id: id_notice_with_me,
          fieldLabel: 'Получение уведомлений по процедурам с моим участием',
          width:150,
          allowNegative:false,
          value:250,
          name:'notice_with_me'
        }
    ];

    var tabs = new Ext.TabPanel({
        id: idTabPanel,
        activeTab: 0,
        frame:true,
        defaults:{autoHeight: true, bodyPadding: 10,labelWidth: 400 },
        items:[
            {
							title: 'Пользовательский интерфейс',
							xtype: 'panel',
							bodyStyle:'padding:5px 5px 0',
							store: component.settings_store,
							items:[ {
									layout:'form',
									items: Tab1items
							}]                
            },
            {
							title: 'Поиск "горящих" процедур',
							xtype: 'panel',
							bodyStyle:'padding:5px 5px 0',
							items:[ {
									layout:'form',
									items: Tab2items
							}]    
            },
            {
							title: 'Календарь событий',
							xtype: 'panel',
							bodyStyle:'padding:5px 5px 0',
							items:[ {
									layout:'form',
									items: Tab3items
							}]
						}
        ]
    });


    Ext.apply(this,
      {
        xtype: 'panel',
        border: false,
        frame: true,
        layout : 'form',
        title: 'Настройки личного кабинета пользователя',
        bodyCssClass: 'subpanel-top-padding',
        items: tabs,
				buttons: [
        {
          text: 'Сохранить настройки',
          scope: this,
          formBind : true,
          handler: function(){
            if (this.getForm().isValid() !== true) {
              Ext.Msg.alert('Ошибка', 'Заполнены не все поля');
            } else {
              var parameters = this.getForm().getValues();

            //  console.log(parameters);
//							this.getForm().findField('signature').setValue(signatureValue);
							this.getForm().submit({
								waitMsg: 'Отправляем данные',
								success: function(form, result){
									onSuccess(result);
								},
								failure: function(form, resp) {
									if (resp && resp.result && resp.result.message) {
										echoResponseMessage(resp);
									}
								}
							});
//              performRPCCall(component.directFn, [parameters], {wait_text: 'Сохраняем данные'}, function(result) {
//                if (result.success) {
//                  Ext.Msg.alert('Успешно', 'Данные отправлены', function() {
//                    redirect_to('#com/procedure/index/type/auctions');
//                  });
//                } else {
//                  Ext.Msg.alert('Ошибка', result.message);
//                }
//              });

            }
          }
        }, {
          text: 'Отмена',
          handler: function() {
            history.back(1);
          }
        }, {
          text: 'GetStore',
          handler: function() {
            var aaa= component.settings_store.getAt(0).store;
						aaa.reload();
        //    console.log(aaa);
						
          }
        }
      ]
    });
    Application.components.UserProfile_mc.superclass.initComponent.call(this);
  }
});
