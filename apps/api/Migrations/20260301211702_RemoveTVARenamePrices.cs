using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShareNSpare.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTVARenamePrices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalPriceHT",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "TotalPriceTTC",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "TvaRate",
                table: "Reservations");

            migrationBuilder.RenameColumn(
                name: "UnitPriceHT",
                table: "Reservations",
                newName: "UnitPrice");

            migrationBuilder.RenameColumn(
                name: "TvaAmount",
                table: "Reservations",
                newName: "TotalPrice");

            migrationBuilder.RenameColumn(
                name: "DailyPriceHT",
                table: "Equipments",
                newName: "DailyPrice");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UnitPrice",
                table: "Reservations",
                newName: "UnitPriceHT");

            migrationBuilder.RenameColumn(
                name: "TotalPrice",
                table: "Reservations",
                newName: "TvaAmount");

            migrationBuilder.RenameColumn(
                name: "DailyPrice",
                table: "Equipments",
                newName: "DailyPriceHT");

            migrationBuilder.AddColumn<decimal>(
                name: "TotalPriceHT",
                table: "Reservations",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalPriceTTC",
                table: "Reservations",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TvaRate",
                table: "Reservations",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }
    }
}
