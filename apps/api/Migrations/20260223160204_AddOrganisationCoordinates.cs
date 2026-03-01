using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShareNSpare.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganisationCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Organisations",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Organisations",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Organisations");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Organisations");
        }
    }
}
