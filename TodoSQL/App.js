import React from 'react';
import { StyleSheet, Text, SafeAreaView, TextInput, FlatList, View, Button, TouchableOpacity } from 'react-native';

import { Constants, SQLite } from 'expo';

const db = SQLite.openDatabase('todo.db');

export default class App extends React.Component {
  state = {
    textValue: '',
    items: []
  }

  executeSql = async (sql, params = []) => {
    return new Promise((resolve, reject) => db.transaction(tx => {
      tx.executeSql(sql, params, (_, { rows }) => resolve(rows._array), reject)
    }))
  }

  componentWillMount () {
    this.init()
  }

  init = async () => {
    await this.executeSql('create table if not exists TODOs (task);');
    this.select()
  }

  _insert = async () => {
    await this.executeSql('insert into TODOs (task) values (?)', [this.state.textValue]);
    this.setState({textValue: ''});
    return true
  }

  _delete = async (task) => {
    await this.executeSql('delete from TODOs where task=?', [task]);
    return true
  }

   select = () => {
    this.executeSql('select * from TODOs', []).then(items => this.setState({items}));
  }

  insert = () => {
    this._insert().then(this.select)
  }

  deleteRow = (task) => {
    // console.log(task);
    this._delete(task).then(this.select)
  }

  listItemRenderer = (item) => {
      return (
        <TouchableOpacity onPress={() => this.deleteRow(item.task)}>
          <View style={styles.listItem}>
            <Text style={styles.itemText}>{item.task}</Text>
          </View>
        </TouchableOpacity>
      );
    }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TextInput
          style={styles.textInput}
          value={this.state.textValue}
          onChangeText={(text) => this.setState({textValue: text})}
        />
        <FlatList
          data={this.state.items}
          style={styles.list}
          renderItem={({item}) => this.listItemRenderer(item)}
          keyExtractor={(item, index) => index}
          ItemSeparatorComponent = {() => (<View style={{height: 10}}/>)}
        />
        <Button
          title={"Add Item"}
          onPress={this.insert}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    width: '90%',
    marginTop: 16,
    marginBottom: 16,
    borderBottomWidth: 2,
    fontSize: 18,
    justifyContent: 'center'
  },
  list: {
    width: '100%',
    flex: 1
  },
  listItem: {
    backgroundColor: "#4286f4",
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemText: {
    fontSize: 18,
    color: 'white',
  }
});
