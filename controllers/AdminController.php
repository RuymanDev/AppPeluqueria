<?php

namespace Controllers;

use Model\AdminCita;
use MVC\Router;

class AdminController
{

    public static function index(Router $router)
    {
        isAuth();

        isAdmin();

        $fecha = $_GET['fecha'] ?? date('Y-m-d');

        $fechas = explode('-', $fecha);

        $year = $fechas[0];
        $mes = $fechas[1];
        $dia = $fechas[2];

        if( !checkdate($mes, $dia, $year) ) {
            header('Location: /404');
        }


        $nombre = $_SESSION['nombre'];

        // Consultar la Base de Datos
        $consulta = "SELECT citas.id, citas.hora, CONCAT( usuarios.nombre, ' ', usuarios.apellido) as cliente, ";
        $consulta .= " usuarios.email, usuarios.telefono, servicios.nombre as servicio, servicios.precio  ";
        $consulta .= " FROM citas  ";
        $consulta .= " LEFT OUTER JOIN usuarios ";
        $consulta .= " ON citas.usuarioId=usuarios.id  ";
        $consulta .= " LEFT OUTER JOIN citasservicios ";
        $consulta .= " ON citasservicios.citaId=citas.id ";
        $consulta .= " LEFT OUTER JOIN servicios ";
        $consulta .= " ON servicios.id=citasservicios.servicioId ";
        $consulta .= " WHERE fecha =  '{$fecha}' ";

        $citas = AdminCita::SQL($consulta);


        $router->render('admin/index', [
            'nombre' => $nombre,
            'citas' => $citas,
            'fecha' => $fecha
        ]);
    }
}
