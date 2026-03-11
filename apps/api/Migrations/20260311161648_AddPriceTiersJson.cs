using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShareNSpare.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPriceTiersJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PriceTiersJson",
                table: "Equipments",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PriceTiersJson",
                table: "Equipments");
        }
    }
}
