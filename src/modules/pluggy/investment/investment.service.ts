import { Investment } from '@entities/investiment.entity';
import { InvestmentInstitution } from '@entities/Investment-institution';
import { User } from '@entities/user.entity';
import { PluggyItemService } from '@modules/pluggy/pluggy-item/pluggy-item.service';
import { PluggyInvestmentResponse } from '@modules/types/pluggy-investment-response.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { In, Repository } from 'typeorm';
import { ApiTokenUtil } from 'utils/getApiTokenUtil';

@Injectable()
export class InvestmentService {
  constructor(
    @InjectRepository(Investment)
    private investmentRepo: Repository<Investment>,

    @InjectRepository(InvestmentInstitution)
    private investmentInstitutionRepo: Repository<InvestmentInstitution>,

    private readonly pluggyItemService: PluggyItemService,
  ) {}

  async findAllByUser(userId: number) {
    // Retorna todos os investimentos do usuário
  }

  async findOne(id: string) {
    // Retorna um investimento específico
  }

  async syncInvestmentsForItem(itemId: string, apiKey: string) {
    const response = await axios.get(
      `https://api.pluggy.ai/investments?itemId=${itemId}`,
      { headers: { 'X-API-KEY': apiKey } },
    );

    return response.data?.results || [];
  }

  async syncInvestmentsFromPluggy(user: User): Promise<Investment[]> {
    console.log(`Syncing investments for user: ${user.id}`);
    const pluggyItems = await this.pluggyItemService.findAllByUser(user);
    const apiKey = await ApiTokenUtil.generatePluggyApiKey();

    const allMapped: Investment[] = [];

    for (const pluggyItem of pluggyItems) {
      const investmentsFromAPI = await this.syncInvestmentsForItem(
        pluggyItem.itemId,
        apiKey,
      );

      const foundIsins = investmentsFromAPI
        .map((inv: PluggyInvestmentResponse) => inv.isin)
        .filter(Boolean);

      const existingInvestments = await this.investmentRepo.findBy({
        isin: In(foundIsins),
      });

      const existingIsins = existingInvestments.map((inv) => inv.isin);

      const newInvestments = investmentsFromAPI.filter(
        (inv: PluggyInvestmentResponse) =>
          inv.isin && !existingIsins.includes(inv.isin),
      );

      const institutionNumbersSet = new Set<string>();
      newInvestments.forEach((inv: PluggyInvestmentResponse) => {
        if (inv.institution?.number) {
          institutionNumbersSet.add(inv.institution.number);
        }
      });

      const existingInstitutions = await this.investmentInstitutionRepo.findBy({
        number: In(Array.from(institutionNumbersSet)),
      });

      const institutionMap = new Map<string, InvestmentInstitution>();
      existingInstitutions.forEach((inst) => {
        institutionMap.set(inst.number, inst);
      });

      // Criar os novos se necessário
      for (const inv of newInvestments) {
        const invInst = inv.institution;
        if (invInst?.number && !institutionMap.has(invInst.number)) {
          const newInst = this.investmentInstitutionRepo.create({
            name: invInst.name,
            number: invInst.number,
          });
          const saved = await this.investmentInstitutionRepo.save(newInst);
          institutionMap.set(saved.number, saved);
        }
      }

      const mapped = this.investmentRepo.create(
        newInvestments.map((inv: PluggyInvestmentResponse) => ({
          name: inv.name,
          code: inv.code,
          isin: inv.isin,
          number: inv.number,
          owner: inv.owner,
          currencyCode: inv.currencyCode,
          type: inv.type,
          subtype: inv.subtype,
          lastMonthRate: inv.lastMonthRate,
          lastTwelveMonthsRate: inv.lastTwelveMonthsRate,
          annualRate: inv.annualRate,
          date: inv.date,
          value: inv.value,
          quantity: inv.quantity,
          amount: inv.amount,
          taxes: inv.taxes,
          taxes2: inv.taxes2,
          balance: inv.balance,
          dueDate: inv.dueDate,
          rate: inv.rate,
          rateType: inv.rateType,
          fixedAnnualRate: inv.fixedAnnualRate,
          issuer: inv.issuer,
          issueDate: inv.issueDate,
          amountProfit: inv.amountProfit,
          amountWithdrawal: inv.amountWithdrawal,
          amountOriginal: inv.amountOriginal,
          status: inv.status,
          metadata: inv.metadata,
          providerId: inv.providerId,
          pluggyItem,
          institution: inv.institution?.number
            ? institutionMap.get(inv.institution.number)
            : undefined,
        })),
      );

      allMapped.push(...mapped);
    }

    return await this.investmentRepo.save(allMapped);
  }
}
