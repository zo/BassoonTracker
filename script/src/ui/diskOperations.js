UI.DiskOperations = function(){

	var me = UI.panel();
	me.hide();

	var currentAction = "load";
	var currentView = "modules";
	var currentsSubView = "";
	var itemsMap = [];

	var modules = [];
	var samples = [];
	var modArchive = [];
	var modulesPl = [];
	var sampleSelectedIndex = 0;
	var moduleSelectedIndex = 0;
	var onLoadChildren = function(){};
	var itemHandler;

	var background = UI.scale9Panel(0,0,20,20,UI.Assets.panelMainScale9);
	background.ignoreEvents = true;
	me.addChild(background);

	var actionPanel = UI.DiskOperationActions();
	me.addChild(actionPanel);

	var typePanel = UI.DiskOperationType();
	me.addChild(typePanel);

	var targetPanel = UI.DiskOperationTargets();
	me.addChild(targetPanel);

	var savePanel = UI.DiskOperationSave();
	me.addChild(savePanel);



	// buttons for small screen UI
    var buttonProperties = {
        background: UI.Assets.buttonKeyScale9,
        activeBackground:UI.Assets.buttonKeyActiveScale9,
        isActive:false,
        textAlign: "center",
        font: window.fontDark,
        paddingTopActive: 1,
		height: 18,
		width: 50
    };

    var saveButton = UI.button();
    var loadButton = UI.button();
    loadButton.setActive(true);

    saveButton.setProperties(buttonProperties);
    saveButton.setLabel("Save");
    saveButton.onDown = function(){
        actionPanel.setSelectedIndex(1);
    };
    me.addChild(saveButton);

    loadButton.setProperties(buttonProperties);
    loadButton.setLabel("Load");
    loadButton.onDown = function(){
        actionPanel.setSelectedIndex(0);
    };
    me.addChild(loadButton);




	var label = UI.label({
		label: "Load module",
		font: fontMed
	});
	me.addChild(label);

	var closeButton = UI.Assets.generate("button20_20");
	closeButton.setLabel("x");
	closeButton.onClick = function(){
        App.doCommand(COMMAND.showTopMain);
	};
	me.addChild(closeButton);


	/*var dropBoxButton = UI.Assets.generate("buttonDark");
	dropBoxButton.setLabel("Dropbox ");
	dropBoxButton.onClick = function(){
		if (Dropbox.isConnected){
			me.refreshList("dropbox");
		}else{
			Dropbox.checkConnected(function(isConnected){
				if (isConnected){
					me.refreshList("dropbox");
				}else{
					console.log("Dropbox not connected");
					Dropbox.authenticate();
				}
			})
		}
	};
	me.addChild(dropBoxButton);
	*/

	var listbox = UI.listbox();
	me.addChild(listbox);


	var dropzone = UI.button();
	dropzone.setProperties({
		background: UI.Assets.buttonDarkActiveScale9,
		image: Y.getImage("dropzone"),
		font: fontSmall,
		textAlign: "center"

	});
	me.addChild(dropzone);
	dropzone.hide();


    me.onShow = function(){
        me.onResize();
    };

	me.onResize = function(){
		if(me.isVisible()){
            me.clearCanvas();

            background.setProperties({
                left: 0,
                top: 0,
                height: me.height,
                width: me.width
            });

            var startTop = 5;

            closeButton.setProperties({
                top: startTop-2,
                width: 20,
                heigth: 18,
                left: me.width - 30
            });


            if (me.width >= 730){

                actionPanel.show();
                label.show();
                loadButton.hide();
                saveButton.hide();

				actionPanel.setProperties({
					top: startTop,
					left: Layout.col1X,
					width: Layout.col1W,
					height: me.height - 10
				});
                typePanel.setProperties({
                    top: startTop,
                    left: Layout.col2X,
                    width: Layout.col1W,
                    height: me.height - 10
                });
                targetPanel.setProperties({
                    top: startTop,
                    left: Layout.col3X,
                    width: Layout.col1W,
                    height: me.height - 10
                });

                label.setProperties({
                    left: Layout.col4X,
                    top: startTop,
                    height: 20,
                    width: Layout.col2W
                });


                listbox.setProperties({
                    left: Layout.col4X,
                    width: Layout.col2W,
                    top: startTop + 19,
                    height: me.height - (19+startTop) - 5
                });

            }else{

            	actionPanel.hide();
                label.hide();
                loadButton.show();
                saveButton.show();

                loadButton.setProperties({
					top: 4,
					left: Layout.col3X
				});
                saveButton.setProperties({
                    top: 4,
                    left: Layout.col3X + 50
                });

                typePanel.setProperties({
                    top: startTop,
                    left: Layout.defaultMargin,
                    width: Layout.col2W,
                    height: (me.height / 2) - startTop - 16
                });

                targetPanel.setProperties({
                    top: me.height / 2 - 16,
                    left: Layout.defaultMargin,
                    width: Layout.col2W,
                    height: me.height / 2 + 16
                });

                listbox.setProperties({
                    left: Layout.col3X,
                    width: Layout.col3W,
                    top: startTop + 19,
                    height: me.height - (19+startTop) - 5
                });

            }

            if (currentAction === "save"){

                savePanel.setProperties({
                    left: listbox.left,
                    width: listbox.width,
                    top: listbox.top,
                    height:listbox.height
                });

                listbox.hide();
                savePanel.show();
            }else{
                listbox.show();
                savePanel.hide();
            }


            dropzone.setProperties({
                left: listbox.left,
                width: listbox.width,
                top: listbox.top,
                height:listbox.height
            });
		}
	};

	me.setView = function(subView){
        currentsSubView = subView;
        me.refreshList(currentsSubView === "samples" ? "samples" : "");

        if (subView === "diskop_save"){
        	actionPanel.setSelectedIndex(1);
		}
        if (subView === "diskop_load"){
            actionPanel.setSelectedIndex(0);
        }
	};

	me.refreshList = function(type){

		if (currentAction === "save") return;

		var items = [];
		var index = 0;

		if (currentView != type) listbox.setSelectedIndex(0,true);
		currentView = type || currentView;

		function addListatLevel(data,level){
			data.forEach(function(item){
				var icon = currentView == "modules" ? Y.getImage("module") : Y.getImage("sample");
				if (item.children) icon = Y.getImage("disk");
				items.push({label: item.title, data: item, level: level, index: index, icon: icon});
				itemsMap[index] = item;
				index++;

				if (item.children && item.children.length && item.isExpanded){
					addListatLevel(item.children,level+1);
				}
			});
		}

		function populate(data,selectedIndex){
			itemsMap = [];
			index = 0;
			selectedIndex = selectedIndex || 0;
			addListatLevel(data,0);
			listbox.setItems(items);
			listbox.setSelectedIndex(selectedIndex);
		}

		if (currentView == "local"){
			listbox.hide();
			dropzone.show();
		}else{
			listbox.show();
			dropzone.hide();

			if (currentView == "bassoon"){
				currentView = typePanel.getType();
			}
		}

		switch (currentView){
			case "modules":
				itemHandler = false;
				label.setLabel("Load Module");
				listbox.onClick = function(e){
					var item = listbox.getItemAtPosition(listbox.eventX,listbox.eventY);
					if (item && item.data){
						var index = item.index;
						item = itemsMap[index];

						if (item.children){
							toggleDirectory(item,index);
						}else{
							listbox.setSelectedIndex(index);
							Tracker.load(item.url);
							App.doCommand(COMMAND.showTopMain);
						}
					}
				};

				if (modules.length){
					populate(modules,moduleSelectedIndex);
				}else{
					FetchService.json("data/modules.json",function(data){
						if (data && data.modules){
							modules = data.modules;
							populate(modules,moduleSelectedIndex);
						}
					})
				}
				break;
			case "modarchive":
				itemHandler = ModArchive;
				label.setLabel("Browse Modarchive");
				listbox.onClick = function(e){
					var item = listbox.getItemAtPosition(listbox.eventX,listbox.eventY);
					if (item && item.data){
						var index = item.index;
						item = itemsMap[index];

						if (item.children){
							toggleDirectory(item,index);
						}else{
							listbox.setSelectedIndex(index);
							Tracker.load(item.url);
                            App.doCommand(COMMAND.showTopMain);
						}
					}
				};
				onLoadChildren = function(item,data){
					if (data && data.length){

						if (item.title == "... load more ..." && item.parent){
							item = item.parent;
							data.forEach(function(child){
								child.parent = item;
							});
							item.children.pop();
							item.children = item.children.concat(data);
						}else{
							data.forEach(function(child){
								child.parent = item;
							});
							item.children = data;
						}
					}else{
						item.children = [{title:"error loading data"}];
						console.error("this does not seem to be a valid modArchive API response");
					}
					me.refreshList();
				};

				if (modArchive.length){
					populate(modArchive,0);
				}else{
					listbox.setItems([{label: "loading ..."}]);

					FetchService.json("data/modarchive.json",function(data){
						if (data && data.modarchive){
							modArchive = data.modarchive;
							populate(modArchive,0);
						}
					});

				}
				break;

			case "modulespl":
				itemHandler = ModulesPl;
				label.setLabel("Browse Modules.pl");
				listbox.onClick = function(e){
					var item = listbox.getItemAtPosition(listbox.eventX,listbox.eventY);
					if (item && item.data){
						var index = item.index;
						item = itemsMap[index];

						if (item.children){
							toggleDirectory(item,index);
						}else{
							listbox.setSelectedIndex(index);
							Tracker.load(item.url);
                            App.doCommand(COMMAND.showTopMain);
						}
					}
				};
				onLoadChildren = function(item,data){
					if (data && data.length){

						if (item.title == "... load more ..." && item.parent){
							item = item.parent;
							data.forEach(function(child){
								child.parent = item;
							});
							item.children.pop();
							item.children = item.children.concat(data);
						}else{
							data.forEach(function(child){
								child.parent = item;
							});
							item.children = data;
						}
					}else{
						item.children = [{title:"error loading data"}];
						console.error("this does not seem to be a valid modArchive API response");
					}
					me.refreshList();
				};

				if (modulesPl.length){
					populate(modulesPl,0);
				}else{
					listbox.setItems([{label: "loading ..."}]);

					FetchService.json("data/modulespl.json",function(data){
						if (data && data.modulespl){
							modulesPl = data.modulespl;
							populate(modulesPl,0);
						}
					});

				}
				break;

			case "dropbox":
				itemHandler = Dropbox;
				label.setLabel("Browse Your Dropbox");

				listbox.setItems([{label: "loading ..."}]);

				listbox.onClick = function(e){
					var item = listbox.getItemAtPosition(listbox.eventX,listbox.eventY);
					if (item && item.data){
						var index = item.index;
						item = itemsMap[index];

						if (item.children){
							toggleDirectory(item,index);
						}else{
							listbox.setSelectedIndex(index);

							UI.setInfo(item.title);
							UI.setStatus("Loading from Dropbox");

							Dropbox.getFile(item.url,function(blob){
								var reader = new FileReader();
								reader.onload = function(){
									Tracker.processFile(reader.result,item.title,function(isMod){
										UI.setStatus("Ready");
									});
								};
								reader.readAsArrayBuffer(blob);
							});

						}
					}
				};

				Dropbox.list("",function(data){
					console.log(data);
					populate(data,0);
				});
				break;
			case "samples":
				itemHandler = false;
				label.setLabel("Load Sample to slot " + Tracker.getCurrentInstrumentIndex());
				listbox.onClick = function(e){
					var item = listbox.getItemAtPosition(listbox.eventX,listbox.eventY);
					if (item && item.data){
						var index = item.index;
						item = itemsMap[index];

						if (item.children){
							listbox.setSelectedIndex(index);
							sampleSelectedIndex = index;
							if (item.isExpanded){
								item.isExpanded = false;
								me.refreshList();
							}else{
								item.isExpanded = true;
								if (item.children.length){
									me.refreshList();
								}else{

									FetchService.json(item.url,function(data){
										if (data && data.samples){
											item.children = data.samples;
											me.refreshList();
										}
									})
								}
							}
						}else{
							listbox.setSelectedIndex(index);
							Tracker.load(item.url);
							//UI.mainPanel.setView("resetTop");
						}

					}
				};
				onLoadChildren = function(item,data){
					if (data && data.samples){
						item.children = data.samples;
						me.refreshList();
					}
				};


				if (samples.length){
					populate(samples,sampleSelectedIndex);
				}else{
					FetchService.json("data/samples.json",function(data){
						if (data && data.samples){
							samples = data.samples;
							populate(samples,sampleSelectedIndex);
						}
					})
				}
				break;
			case "local":
				itemHandler = false;
				label.setLabel("Upload files");
				break;
		}

	};

	me.playRandomSong = function(){
		UI.setStatus("Fetching random song");
		UI.setInfo("");
		FetchService.json("https://www.stef.be/bassoontracker/api/random",function(data){
			if (data && data.modarchive && data.modarchive.module){
				Tracker.load(data.modarchive.module.url);
			}else{
				console.error("this does not seem to be a valid modArchive API response");
			}
		})
	};


	function toggleDirectory(item,index){
		listbox.setSelectedIndex(index);
		moduleSelectedIndex = index;
		if (item.isExpanded){
			item.isExpanded = false;
			me.refreshList();
		}else{
			item.isExpanded = true;
			if (item.children.length){
				me.refreshList();
			}else{
				console.log("load children from " + item.url);
				item.children = [{title: "loading ..."}];
				me.refreshList();

				if (itemHandler){
					itemHandler.get(item.url,function(data){
						onLoadChildren(item,data);
					});
				}else{
					FetchService.json(item.url,function(data){
						onLoadChildren(item,data);
					})
				}



			}
		}
	}


    EventBus.on(EVENT.diskOperationTargetChange,function(target){

    	var action = actionPanel.getAction();

        if (target && target.target) target = target.target;
        if (target && target.fileType){
            if (target.fileType === FILETYPE.module) target = "modules";
            if (target.fileType === FILETYPE.sample) target = "samples";
        }
        if (typeof target === "undefined") target = targetPanel.getTarget();

        console.log(target);

    	if (action === "save"){
            currentAction = "save";
            currentView = typePanel.getType();

            var labelText = "Export Module";
            if (currentView === "samples")  labelText = "Export Sample";
            label.setLabel(labelText);

            if (loadButton.isActive) loadButton.setActive(false);
            if (!saveButton.isActive) saveButton.setActive(true);

			me.onResize();
		}else{
            currentAction = "load";
            me.refreshList(target);

            if (!loadButton.isActive) loadButton.setActive(true);
            if (saveButton.isActive) saveButton.setActive(false);
		}

    });


	EventBus.on(EVENT.instrumentChange,function(value){
		if (me.isVisible() && currentView == "samples") label.setLabel("Load Sample to slot " + Tracker.getCurrentInstrumentIndex());
	});

	return me;

};

