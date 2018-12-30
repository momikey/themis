import { Controller, Post, Body, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserAuthenticationService } from './user-authentication.service';
import { JwtPayload } from './jwt.interface';
import { CreateAccountDto } from './create-account.dto';
import { LoginDto } from './login.dto';

@Controller('internal/authenticate')
export class UserAuthenticationController {
    constructor(private readonly authService: UserAuthenticationService) {}

    @Post('create-token')
    async createToken(@Body() user: JwtPayload): Promise<any> {
        const result = await this.authService.createToken(user);

        return result;
    }

    @Post('create-account')
    async createAccount(@Body() user: CreateAccountDto): Promise<any> {
        try {
            const result = await this.authService.createAccount(user);

            return result;
        } catch (e) {
            return e;
        }
    }

    @Post('login')
    async verifyLogin(@Body() user: LoginDto): Promise<any> {
        if (await this.authService.validateLogin(user)) {
            return "Login successful";
        } else {
            throw new ForbiddenException;
        }
    }
}
