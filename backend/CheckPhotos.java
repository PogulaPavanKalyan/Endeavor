import java.sql.*;

public class CheckPhotos {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/endeavor", "root", "groot");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT id, tittle, photo_id FROM conference_details");
            System.out.println("Conferences:");
            while (rs.next()) {
                System.out.println("ID: " + rs.getLong("id") + " Title: " + rs.getString("tittle") + " Photo ID: " + rs.getLong("photo_id"));
            }

            ResultSet rs2 = stmt.executeQuery("SELECT * FROM conference_photos");
            System.out.println("Photos:");
            while (rs2.next()) {
                System.out.println("ID: " + rs2.getLong("id") + " File: " + rs2.getString("file_name"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
