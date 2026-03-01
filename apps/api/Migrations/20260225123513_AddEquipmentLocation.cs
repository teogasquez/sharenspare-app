using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShareNSpare.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEquipmentLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Equipments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Canton",
                table: "Equipments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Equipments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Equipments",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Equipments",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "Canton",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Equipments");
        }
    }
}
