import {
  Association,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  Model,
  Sequelize,
} from 'sequelize'

export class Manager extends Model {
  public id!: number // Note that the `null assertion` `!` is required in strict mode.
  public guildId!: string
  public channelId!: string
  public memberId!: string
  public startMessageId!: string
  public creatingMessageIds!: string
  public finishMessageId!: string
  public isCreating!: boolean

  // timestamps!
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Since TS cannot determine model association at compile time
  // we have to declare them here purely virtually
  // these will not exist until `Model.init` was called.
  public getRoles!: HasManyGetAssociationsMixin<Role>
  public addRole!: HasManyAddAssociationMixin<Role, number>
  public hasRole!: HasManyHasAssociationMixin<Role, number>
  public countRoles!: HasManyCountAssociationsMixin
  public createRole!: HasManyCreateAssociationMixin<Role>

  // You can also pre-declare possible inclusions, these will only be populated if you
  // actively include a relation.
  public readonly Roles?: Role[] // Note this is optional since it's only populated when explicitly requested in code

  public static associations: {
    roles: Association<Manager, Role>
  }
}

export class Role extends Model {
  public id!: number
  public roleId!: string
  public ManagerId!: string
  public name!: string
  public position!: number
  public hexColor!: string
  public guildId!: string
  public channelId!: string
  public panelMessageId!: string
  public creatingMessageId!: string
  public emojiCreating!: string
  public emoji!: string
  public isOnPanel!: boolean

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

const sequelize = new Sequelize('sqlite:./db.sqlite3')

Manager.init(
  {
    guildId: { type: DataTypes.TEXT },
    channelId: { type: DataTypes.TEXT },
    memberId: { type: DataTypes.TEXT },
    startMessageId: { type: DataTypes.TEXT },
    creatingMessageIds: { type: DataTypes.TEXT },
    finishMessageId: { type: DataTypes.TEXT },
    isCreating: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    tableName: 'managers',
  }
)

Role.init(
  {
    roleId: { type: DataTypes.TEXT },
    name: { type: DataTypes.TEXT },
    position: { type: DataTypes.INTEGER },
    hexColor: { type: DataTypes.TEXT },
    guildId: { type: DataTypes.TEXT },
    channelId: { type: DataTypes.TEXT },
    memberId: { type: DataTypes.TEXT },
    panelMessageId: { type: DataTypes.TEXT },
    creatingMessageId: { type: DataTypes.TEXT },
    emojiCreating: { type: DataTypes.TEXT },
    emoji: { type: DataTypes.TEXT },
    isOnPanel: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    tableName: 'roles',
  }
)

Role.belongsTo(Manager, { targetKey: 'id' })

Role.sync()
Manager.sync()
