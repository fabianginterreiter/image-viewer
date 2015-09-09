function create(knex) {
  knex.schema.createTable('directories', function(table) {
    table.increments();
    table.string('name');
    table.string('path');
    table.integer('directory_id').unsigned();
  }).createTable('images', function(table) {
    table.increments();
    table.string('name');
    table.integer('size').unsigned();
    table.integer('orientation');
    table.integer('width');
    table.integer('height');
    table.integer('directory_id').unsigned().references('directories.id');
    table.string('title');
    table.string('description');
    table.boolean('gps');
    table.float('latitute');
    table.float('longitute');
    table.boolean('deleted');
    table.timestamps();
  }).createTable('galleries', function(table) {
    table.increments();
    table.string('name');
    table.string('description');
    table.integer('parent_id').unsigned();
    table.integer('image_id').unsigned().references('images.id');
    table.timestamps();
  }).createTable('persons', function(table) {
    table.increments();
    table.string('name');
    table.integer('image_id').unsigned().references('images.id');
    table.timestamps();
  }).createTable('users', function (table) {
    table.increments();
    table.string('name');
    table.timestamps();
    table.integer('person_id').unsigned().references('persons.id');
  }).createTable('tags', function(table) {
    table.increments();
    table.string('text');
    table.timestamps();
  }).createTable('gallery_image', function(table) {
    table.integer('gallery_id').unsigned().references('galleries.id');
    table.integer('image_id').unsigned().references('images.id');
  }).createTable('image_person', function(table) {
    table.integer('person_id').unsigned().references('persons.id');
    table.integer('image_id').unsigned().references('images.id');
  }).createTable('image_tag', function(table) {
    table.integer('tag_id').unsigned().references('tags.id');
    table.integer('image_id').unsigned().references('images.id');
  });
  }